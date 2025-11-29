import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";
import { Repository } from "typeorm";
import { Alert } from "./Domain/models/Alert";
import { AlertService } from "./Services/AlertService";
import { AlertController } from "./WebAPI/controllers/AlertController";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? "*",
  methods: process.env.CORS_METHODS?.split(",") ?? ["GET", "POST"]
}));

initialize_database();

// Repo
const alertRepository: Repository<Alert> = Db.getRepository(Alert);

// Service
const alertService = new AlertService(alertRepository);

// Controller
const alertController = new AlertController(alertService);
app.use("/api/v1", alertController.getRouter());

export default app;
