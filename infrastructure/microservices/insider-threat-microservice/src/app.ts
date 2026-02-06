import express, { Application } from "express";
import cors from "cors";
import { Db } from "./Database/DbConnectionPool";
import { initialize_database } from "./Database/InitializeConnection";
import { InsiderThreat } from "./Domain/models/InsiderThreat";
import { UserRiskProfile } from "./Domain/models/UserRiskProfile";
import { InsiderThreatRepositoryService } from "./Services/InsiderThreatRepositoryService";
import { UserRiskRepositoryService } from "./Services/UserRiskRepositoryService";
import { InsiderThreatService } from "./Services/InsiderThreatService";
import { UserRiskAnalysisService } from "./Services/UserRiskAnalysisService";
import { ThreatDetectionService } from "./Services/ThreatDetectionService";
import { EventFetcherService } from "./Services/EventFetcherService"; 
import { LoggerService } from "./Services/LoggerService";
import { InsiderThreatController } from "./WebAPI/controllers/InsiderThreatController";
import { ThreatAnalysisJob } from "./Jobs/ThreatAnalysisJob";

const app: Application = express();
const PORT = process.env.PORT || 5792;
const EVENT_COLLECTOR_URL = process.env.EVENT_COLLECTOR_URL || "http://localhost:8259/api/v1";

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ 
    service: "Insider Threat Detection Service",
    version: "1.0.0",
    status: "running"
  });
});

(async () => {
  await initialize_database();

  const logger = new LoggerService();
  const threatRepository = Db.getRepository(InsiderThreat);
  const riskRepository = Db.getRepository(UserRiskProfile);
  const threatRepoService = new InsiderThreatRepositoryService(threatRepository, logger);
  const riskRepoService = new UserRiskRepositoryService(riskRepository, logger);
  const threatService = new InsiderThreatService(threatRepoService, logger); 
  const eventFetcherService = new EventFetcherService(EVENT_COLLECTOR_URL, logger);
  const threatDetectionService = new ThreatDetectionService(
    eventFetcherService,
    logger
  );

  const riskService = new UserRiskAnalysisService(
    riskRepoService,
    threatRepoService,
    logger
  );

  const controller = new InsiderThreatController(
    threatService,
    riskService,
    logger
  );

  app.use("/api/v1", controller.getRouter());

  app.listen(PORT, () => {
    logger.log(`[TCPListen@InsiderThreat] localhost:${PORT}`);
  });

  const job = new ThreatAnalysisJob(
    eventFetcherService,
    threatService,
    riskService,
    threatDetectionService,
    logger,
    15
  );

  job.start();
})();

export default app;