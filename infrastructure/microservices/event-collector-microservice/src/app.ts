import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { initialize_database } from './Database/InitializeConnection';
import { Repository } from 'typeorm';
import { Db } from './Database/DbConnectionPool';
import { Event } from './Domain/models/Event';
import { IEventsService } from './Domain/services/IEventsService';
import { EventsService } from './Services/EventsService';
import { EventsController } from './WebAPI/controllers/EventsController';
import { ILoggerService } from './Domain/services/ILoggerService';
import { LoggerService } from './Services/LoggerService';

dotenv.config({ quiet: true });

const app = express();

// parsiranje JSON body-ja
app.use(express.json());

// CORS podešavanje iz .env
const corsOrigin =
  process.env.CORS_ORIGIN?.split(",").map((m) => m.trim()) ?? ["*"];

const corsMethods =
  process.env.CORS_METHODS?.split(",").map((m) => m.trim()) ??
  ["GET", "POST", "DELETE", "OPTIONS"];

app.use(
  cors({
    origin: corsOrigin,
    methods: corsMethods,
  }),
);

// inicijalizacija baze
void (async () => {
  await initialize_database();
})();

// ORM Repository
const eventRepository: Repository<Event> = Db.getRepository(Event);

// Servisi
const eventsService: IEventsService = new EventsService(eventRepository);
const loggerService: ILoggerService = new LoggerService();

// WebAPI rute
const eventsController = new EventsController(eventsService, loggerService);

// Registracija ruta
app.use('/api/v1', eventsController.getRouter());

export default app;
