import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";
import { Repository } from "typeorm";
import { Alert } from "./Domain/models/Alert";
import { AlertController } from "./WebAPI/controllers/AlertController";
import { AlertRepositoryService } from "./Services/AlertRepositoryService";
import { ThreatAnalyzerService } from "./Services/ThreatAnalyzerService";
import { AlertService } from "./Services/AlertService";


dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? "*",
  methods: process.env.CORS_METHODS?.split(",") ?? ["GET", "POST", "PUT", "DELETE"]
}));

initialize_database();

const typeormAlertRepo: Repository<Alert> = Db.getRepository(Alert);
const alertRepository = new AlertRepositoryService(typeormAlertRepo);
const threatAnalyzer = new ThreatAnalyzerService(alertRepository);
const alertService = new AlertService(alertRepository, threatAnalyzer);
const alertController = new AlertController(alertService);
app.use("/api/v1", alertController.getRouter());

export default app;
