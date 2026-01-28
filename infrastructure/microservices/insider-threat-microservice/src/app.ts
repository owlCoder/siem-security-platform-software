import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";
import { Repository } from "typeorm";
import { InsiderThreat } from "./Domain/models/InsiderThreat";
import { UserRiskProfile } from "./Domain/models/UserRiskProfile";
import { UserCache } from "./Domain/models/UserCache";
import { InsiderThreatController } from "./WebAPI/controllers/InsiderThreatController";
import { InternalController } from "./WebAPI/controllers/InternalController";
import { InsiderThreatRepositoryService } from "./Services/InsiderThreatRepositoryService";
import { InsiderThreatService } from "./Services/InsiderThreatService";
import { UserRiskRepositoryService } from "./Services/UserRiskRepositoryService";
import { UserRiskAnalysisService } from "./Services/UserRiskAnalysisService";
import { ThreatDetectionService } from "./Services/ThreatDetectionService";
import { UserCacheService } from "./Services/UserCacheService";
import { LoggerService } from "./Services/LoggerService";
import { ThreatAnalysisJob } from "./Jobs/ThreatAnalysisJob";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
    methods: process.env.CORS_METHODS?.split(",") ?? ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

initialize_database();

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "InsiderThreatService",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Repositories
const typeormThreatRepo: Repository<InsiderThreat> = Db.getRepository(InsiderThreat);
const typeormRiskRepo: Repository<UserRiskProfile> = Db.getRepository(UserRiskProfile);
const typeormUserCacheRepo: Repository<UserCache> = Db.getRepository(UserCache);

// Services
const logger = new LoggerService();
const threatRepository = new InsiderThreatRepositoryService(typeormThreatRepo, logger);
const threatService = new InsiderThreatService(threatRepository, logger);
const riskRepository = new UserRiskRepositoryService(typeormRiskRepo, logger);
const riskService = new UserRiskAnalysisService(riskRepository, threatRepository, logger);
const detectionService = new ThreatDetectionService(logger);
const userCacheService = new UserCacheService(typeormUserCacheRepo, logger);

// Controller
const insiderThreatController = new InsiderThreatController(
  threatService,
  riskService,
  logger
);

const internalController = new InternalController(
  userCacheService,
  logger
);

app.use("/api/v1", insiderThreatController.getRouter());
app.use("/api/v1/internal", internalController.getRouter());

const EVENT_COLLECTOR_URL = process.env.EVENT_COLLECTOR_URL || "http://localhost:8259/api/v1";
const JOB_INTERVAL_MINUTES = parseInt(process.env.THREAT_ANALYSIS_INTERVAL_MINUTES || "15", 10);

logger.log(`Event Collector URL: ${EVENT_COLLECTOR_URL}`);
logger.log(`Job interval: ${JOB_INTERVAL_MINUTES} minutes`);

const threatAnalysisJob = new ThreatAnalysisJob(
  EVENT_COLLECTOR_URL,
  threatService,
  riskService,
  detectionService,
  userCacheService,
  logger,
  JOB_INTERVAL_MINUTES
);

setTimeout(() => {
  logger.log("=".repeat(60));
  logger.log("STARTING THREAT ANALYSIS JOB");
  logger.log("=".repeat(60));
  threatAnalysisJob.start();
}, 30000);

process.on("SIGINT", () => {
  logger.log("\n" + "=".repeat(60));
  logger.log("SHUTTING DOWN INSIDER THREAT SERVICE");
  logger.log("=".repeat(60));
  threatAnalysisJob.stop();
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

process.on("SIGTERM", () => {
  logger.log("\n" + "=".repeat(60));
  logger.log("SHUTTING DOWN INSIDER THREAT SERVICE");
  logger.log("=".repeat(60));
  threatAnalysisJob.stop();
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

export default app;