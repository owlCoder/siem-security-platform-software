import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import { initialize_database } from './Database/InitializeConnection';
import dotenv from 'dotenv';

import { ICorrelationService } from './Domain/Services/ICorrelationService';
import { CorrelationService } from './Services/CorrelationService';

import { ILLMChatAPIService } from './Domain/Services/ILLMChatAPIService';
import { LLMChatAPIService } from './Services/LLMChatAPIService';

import { RecurringCorrelationJob } from './Services/ReccuringCorrelationJob';
import { IntervalScheduler } from './Infrastructure/schedulers/IntervalScheduler';

import { Repository } from 'typeorm';
import { Correlation } from './Domain/models/Correlation';
import { Db } from './Database/DbConnectionPool';
import { CorrelationEventMap } from './Domain/models/CorrelationEventMap';
import { AnalysisEngineController } from './WebAPI/controllers/AnalysisEngineController';

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["POST"];

// Protected microservice from unauthorized access
app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

app.use(express.json());

initialize_database();

//======================================ANALYSIS ENGINE===========================================

const CorrelationRepo: Repository<Correlation> = Db.getRepository(Correlation);

const CorrelationMapRepo: Repository<CorrelationEventMap> = Db.getRepository(CorrelationEventMap);

const llmChatAPIService: ILLMChatAPIService = new LLMChatAPIService();
const correlationService: ICorrelationService = new CorrelationService(CorrelationRepo, CorrelationMapRepo, llmChatAPIService);


const analysisEngineController = new AnalysisEngineController(correlationService, llmChatAPIService);

app.use('/api/v1', analysisEngineController.getRouter());

export function startRecurringJobs() {
    const recurringCorrelationJob = new RecurringCorrelationJob(correlationService);
    const intervalMs = 15 * 60 * 1000; // 15 minutes

    const intervalScheduler = new IntervalScheduler(recurringCorrelationJob, intervalMs);
    intervalScheduler.start();
}

export default app;
