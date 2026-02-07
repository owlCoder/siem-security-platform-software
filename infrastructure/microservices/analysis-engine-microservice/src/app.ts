import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";

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
/* ===================== HEALTH CHECK ===================== */

app.get("/health", async (req, res) => {
  try {
    res.status(200).json({
      status: "OK",
      service: "AnalysisEngineService", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (err) {
    res.status(503).json({
      status: "DOWN",
      service: "AnalysisEngineService",
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : "Database error"
    });
  }
});


/* ===================== Composition ===================== */

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
