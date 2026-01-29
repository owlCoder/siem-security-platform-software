import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { Repository } from "typeorm";

import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";

// Domain models
import { ServiceThreshold } from "./Domain/models/ServiceThreshold";
import { ServiceCheck } from "./Domain/models/ServiceCheck";
import { ServiceIncident } from "./Domain/models/ServiceIncident";

// Domain interfaces
import { IMonitoringService } from "./Domain/services/IMonitoringService";
import { IIncidentService } from "./Domain/services/IIncidentService";

// Services
import { MonitoringService } from "./Services/MonitoringService";
import { IncidentService } from "./Services/IncidentService";
import { MonitoringOrchestrator } from "./Services/MonitoringOrchestrator";

// Jobs & scheduler
import { RecurringMonitoringJob } from "./Services/RecurringMonitoringJob";
import { IntervalScheduler } from "./System/schedulers/IntervalScheduler";

// Controllers
import { StatusMonitorController } from "./WebAPI/controllers/StatusMonitorController";

dotenv.config({ quiet: true });

const app = express();

/* ========================
   CORS
======================== */
const corsOrigin =
  process.env.CORS_ORIGIN?.split(",").map(o => o.trim()) ?? "*";

const corsMethods =
  process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["GET"];

app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

app.use(express.json());

/* ========================
   DATABASE
======================== */
initialize_database();

/* ========================
   ORM REPOSITORIES
======================== */
const thresholdRepository: Repository<ServiceThreshold> =
  Db.getRepository(ServiceThreshold);

const checkRepository: Repository<ServiceCheck> =
  Db.getRepository(ServiceCheck);

const incidentRepository: Repository<ServiceIncident> =
  Db.getRepository(ServiceIncident);

/* ========================
   SERVICES
======================== */
const monitoringService: IMonitoringService =
  new MonitoringService(thresholdRepository, checkRepository);

const incidentService: IIncidentService =
  new IncidentService(checkRepository, incidentRepository, thresholdRepository);

const monitoringOrchestrator = new MonitoringOrchestrator(
    monitoringService,
    incidentService,
    thresholdRepository
);

/* ========================
   CONTROLLERS
======================== */
const statusMonitorController =
  new StatusMonitorController(
    monitoringService,
    incidentService,
    checkRepository,
    incidentRepository,
    thresholdRepository
  );

/* ========================
   ROUTES
======================== */
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", service: "StatusMonitor" });
});

app.use("/api/v1", statusMonitorController.getRouter());

/* ========================
   JOBS
======================== */
const monitoringJob = new RecurringMonitoringJob(monitoringOrchestrator);

const intervalSec =
  Number(process.env.DEFAULT_CHECK_INTERVAL_SEC ?? "30");

const scheduler =
  new IntervalScheduler(monitoringJob, intervalSec * 1000);

scheduler.start();

export default app;
