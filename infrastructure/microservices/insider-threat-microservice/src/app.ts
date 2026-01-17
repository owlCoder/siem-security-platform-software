import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";
import { Repository } from "typeorm";
import { InsiderThreat } from "./Domain/models/InsiderThreat";
import { UserRiskProfile } from "./Domain/models/UserRiskProfile";
import { InsiderThreatController } from "./WebAPI/controllers/InsiderThreatController";
import { InsiderThreatRepositoryService } from "./Services/InsiderThreatRepositoryService";
import { InsiderThreatService } from "./Services/InsiderThreatService";
import { UserRiskRepositoryService } from "./Services/UserRiskRepositoryService";
import { UserRiskAnalysisService } from "./Services/UserRiskAnalysisService";
import { ThreatDetectionService } from "./Services/ThreatDetectionService";
import { LoggerService } from "./Services/LoggerService";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
    methods: process.env.CORS_METHODS?.split(",") ?? ["GET", "POST", "PUT"],
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

// Services
const logger = new LoggerService();
const threatRepository = new InsiderThreatRepositoryService(typeormThreatRepo, logger);
const threatService = new InsiderThreatService(threatRepository, logger);
const riskRepository = new UserRiskRepositoryService(typeormRiskRepo, logger);
const riskService = new UserRiskAnalysisService(riskRepository, threatRepository, logger);
const detectionService = new ThreatDetectionService(logger);

// Controller
const insiderThreatController = new InsiderThreatController(
  threatService,
  riskService,
  logger
);

app.use("/api/v1", insiderThreatController.getRouter());

export default app;