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
import { AlertService } from "./Services/AlertService";
import { AlertNotificationService } from "./Services/AlertNotificationService";

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
    service: "AlertService",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Repositories
const typeormAlertRepo: Repository<Alert> = Db.getRepository(Alert);

// Services
const alertRepository = new AlertRepositoryService(typeormAlertRepo);
const alertService = new AlertService(alertRepository);
const alertNotificationService = new AlertNotificationService();

// Controller
const alertController = new AlertController(alertService, alertNotificationService);
app.use("/api/v1", alertController.getRouter());

export default app;