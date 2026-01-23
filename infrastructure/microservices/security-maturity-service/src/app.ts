import express from "express";
import dotenv from "dotenv";
import { initialize_database } from "./Database/InitializeConnection";
import { KpiRepositoryService } from "./Services/KpiRepositoryService";
import { KpiSnapshotQuery } from "./Application/queries/KpiSnapshotQuery";
import { SecurityMaturityController } from "./WebAPI/controllers/SecurityMaturityController";

dotenv.config();

const app = express();
app.use(express.json());

initialize_database();

// services
const kpiRepositoryService = new KpiRepositoryService();

// query
const kpiSnapshoutQuery = new KpiSnapshotQuery(kpiRepositoryService);

// controllers
const securityMaturityController = new SecurityMaturityController(
  kpiSnapshoutQuery,
);

app.use("/api/v1", securityMaturityController.getRouter());

export default app;
