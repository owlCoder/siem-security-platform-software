import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import { initialize_database } from './Database/InitializeConnection';
import dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { Db } from './Database/DbConnectionPool';
import { ParserEvent } from './Domain/models/ParserEvent';
import { IParserService } from './Domain/services/IParserService';
import { ParserService } from './Services/ParserService';
import { ParserController } from './WebAPI/controllers/ParserController';
import { EventValidator } from './Application/validators/EventValidator';
import { IParserRepositoryService } from './Domain/services/IParserRepositoryService';
import { ParserRepositoryService } from './Services/ParserRepositoryService';
import { ILogerService } from './Domain/services/ILogerService';
import { LogerService } from './Services/LogerService';

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN?.split(",").map(m => m.trim()) ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["POST"];

// Protected microservice from unauthorized access
app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

app.use(express.json());

initialize_database();

// ORM Repositories
const parserEventRepository: Repository<ParserEvent> = Db.getRepository(ParserEvent);

// Validators
const validator = new EventValidator();

// Services
const parserService: IParserService = new ParserService(parserEventRepository, validator);
const parserRepositoryService: IParserRepositoryService = new ParserRepositoryService(parserEventRepository);
const logger: ILogerService = new LogerService();

// WebAPI routes
const parserController = new ParserController(parserService, parserRepositoryService, logger);

// Registering routes
app.use('/api/v1', parserController.getRouter());

export default app;
