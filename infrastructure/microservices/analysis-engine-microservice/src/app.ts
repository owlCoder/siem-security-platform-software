import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { Repository } from "typeorm";

import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";

import { Correlation } from "./Domain/models/Correlation";
import { CorrelationEventMap } from "./Domain/models/CorrelationEventMap";

import { ICorrelationService } from "./Domain/services/ICorrelationService";
import { CorrelationService } from "./Services/CorrelationService";

import { ILLMChatAPIService } from "./Domain/services/ILLMChatAPIService";
import { LLMChatAPIService } from "./Services/LLMChatAPIService";

import { IntervalScheduler } from "./Infrastructure/schedulers/IntervalScheduler";
import { RecurringCorrelationJob } from "./Services/ReccuringCorrelationJob";

import { AnalysisEngineController } from "./WebAPI/controllers/AnalysisEngineController";

import { ILoggerService } from "./Domain/services/ILoggerService";
import { LoggerService } from "./Services/LoggerService";

dotenv.config({ quiet: true });

const app = express();

const loggerService: ILoggerService = new LoggerService();

/* ===================== Middleware ===================== */

const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map((m) => m.trim()) ?? ["POST"];

app.use(
  cors({
    origin: corsOrigin,
    methods: corsMethods,
  })
);

app.use(express.json());
/* ===================== Startup ===================== */

export async function initializeApp(): Promise<void> {
  try {
    await initialize_database(Db, loggerService);
  } catch {
    await loggerService.error("[App] initialize_database threw");
  }
}

/* ===================== Composition ===================== */

const correlationRepo: Repository<Correlation> = Db.getRepository(Correlation);
const correlationMapRepo: Repository<CorrelationEventMap> = Db.getRepository(CorrelationEventMap);

const llmChatAPIService: ILLMChatAPIService = new LLMChatAPIService(loggerService);

const correlationService: ICorrelationService = new CorrelationService(
  llmChatAPIService,
  loggerService
);

const analysisEngineController = new AnalysisEngineController(
  llmChatAPIService,
  loggerService
);

app.use("/api/v1", analysisEngineController.getRouter());

/* ===================== Jobs ===================== */

export function startRecurringJobs(): void {
  const recurringCorrelationJob = new RecurringCorrelationJob(correlationService, loggerService);
  const intervalMs = 60 * 60 * 1000;

  recurringCorrelationJob.execute();

  const intervalScheduler = new IntervalScheduler(recurringCorrelationJob, intervalMs, loggerService);
  intervalScheduler.start();
}

export default app;
