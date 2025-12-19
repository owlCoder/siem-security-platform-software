import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { initialize_mongo_database, initialize_mysql_database } from './Database/InitializeConnection';
import { MongoDb, MySQLDb } from './Database/DbConnectionPool';
import { CacheEntry } from './Domain/models/CacheEntry';
import { Event } from './Domain/models/Event';
import { MongoRepository, Repository } from 'typeorm';
import { QueryRepositoryService } from './Services/QueryRepositoryService';
import { QueryService } from './Services/QueryService';
import { LoggerService } from './Services/LoggerService';
import { QueryController } from './WebAPI/controllers/QueryController';
import { saveQueryState } from './Utils/StateManager';


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
let loggerService: LoggerService;
let queryRepositoryService: QueryRepositoryService;

// inicijalizacija baza i servisa
void (async () => {
  await initialize_mongo_database();
  await initialize_mysql_database();

  // ORM Repository
  const cacheRepository : MongoRepository<CacheEntry> = MongoDb.getMongoRepository(CacheEntry);
  const eventRepository : Repository<Event> = MySQLDb.getRepository(Event);
  //const test = await eventRepository.find();
  //console.log("EVENTS FROM DB:", test);

  // Servisi
  loggerService = new LoggerService();
  queryRepositoryService = new QueryRepositoryService(cacheRepository, loggerService, eventRepository);
  const queryService = new QueryService(queryRepositoryService);

  // WebAPI rute
  const queryController = new QueryController(queryService, queryRepositoryService);

  // Registracija ruta
  app.use('/api/v1', queryController.getRouter());
})();

process.on('SIGINT', async () => {
  try {
    loggerService.log("Saving query service state before shutdown...");

    // ako se inverted indeks struktura azurira => sacekaj da se zavrsi
    while (queryRepositoryService.isIndexingInProgress()) {
      loggerService.log("Indexing in progress, waiting to save state...");
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    saveQueryState({
      lastProcessedId: queryRepositoryService.getLastProcessedId(),
      invertedIndex: queryRepositoryService.getInvertedIndex(),
      eventTokenMap: queryRepositoryService.getEventIdToTokens(),
      eventCount: queryRepositoryService.getEventsCount(),
      infoCount: queryRepositoryService.getInfoCount(),
      warningCount: queryRepositoryService.getWarningCount(),
      errorCount: queryRepositoryService.getErrorCount()
    });
    loggerService.log("State saved. Exiting...");
    process.exit(0);
  } catch(err){
    loggerService.log(`Error during shutdown: ${err}`);
    process.exit(1);
  }

});

export default app;
