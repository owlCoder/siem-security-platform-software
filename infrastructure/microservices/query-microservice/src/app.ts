import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { initialize_alert_database, initialize_mongo_database, initialize_mysql_database } from './Database/InitializeConnection';
import { AlertDb, MongoDb, MySQLDb } from './Database/DbConnectionPool';
import { CacheEntry } from './Domain/models/CacheEntry';
import { Event } from './Domain/models/Event';
import { MongoRepository, Repository } from 'typeorm';
import { QueryRepositoryService } from './Services/QueryRepositoryService';
import { QueryService } from './Services/QueryService';
import { LoggerService } from './Services/LoggerService';
import { QueryController } from './WebAPI/controllers/QueryController';
import { saveQueryState } from './Utils/StateManager';
import { Alert } from './Domain/models/Alert';
import { QueryAlertRepositoryService } from './Services/QueryAlertRepositoryService';
import { CacheAlertEntry } from './Domain/models/CacheAlertEntry';


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
let queryAlertRepositoryService : QueryAlertRepositoryService; 

// inicijalizacija baza i servisa
void (async () => {
  await initialize_mongo_database();
  await initialize_mysql_database();
  await initialize_alert_database();

  // ORM Repository
  const cacheRepository : MongoRepository<CacheEntry> = MongoDb.getMongoRepository(CacheEntry);
  const cacheAlertRepository : MongoRepository<CacheAlertEntry> = MongoDb.getMongoRepository(CacheAlertEntry);
  const eventRepository : Repository<Event> = MySQLDb.getRepository(Event);
  const alertRepository : Repository<Alert> = AlertDb.getRepository(Alert);
  //const test = await eventRepository.find();
  //console.log("EVENTS FROM DB:", test);

  // Servisi
  loggerService = new LoggerService();
  queryRepositoryService = new QueryRepositoryService(cacheRepository, loggerService, eventRepository);
  const queryService = new QueryService(queryRepositoryService);
  queryAlertRepositoryService = new QueryAlertRepositoryService(cacheAlertRepository, loggerService, alertRepository);
  

  // WebAPI rute
  const queryController = new QueryController(queryService, queryRepositoryService, queryAlertRepositoryService);

  // Registracija ruta
  app.use('/api/v1', queryController.getRouter());
})();

process.on('SIGINT', async () => {
  try {
    loggerService.log("Saving query service state before shutdown...");

    // ako se inverted indeks struktura azurira => sacekaj da se zavrsi
    while (queryRepositoryService.invertedIndexStructureForEvents.isIndexingInProgress()) {
      loggerService.log("Indexing in progress, waiting to save state...");
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    saveQueryState({
      lastProcessedId: queryRepositoryService.invertedIndexStructureForEvents.getLastProcessedId(),
      invertedIndex: queryRepositoryService.invertedIndexStructureForEvents.getInvertedIndex(),
      eventTokenMap: queryRepositoryService.invertedIndexStructureForEvents.getEventIdToTokens(),
      eventCount: queryRepositoryService.getEventsCount(),
      infoCount: queryRepositoryService.getInfoCount(),
      warningCount: queryRepositoryService.getWarningCount(),
      errorCount: queryRepositoryService.getErrorCount()
    });
    loggerService.log("State saved. Exiting...");
    /*OVDE DODATI CUVANJE STANJA INVERTED INDEX STRUKTURE SA ALERTOVIMA NAKON DODAVANJA U qureyAlertRepoService-u
    saveQueryAlertState({
      
    });*/
    process.exit(0);
  } catch(err){
    loggerService.log(`Error during shutdown: ${err}`);
    process.exit(1);
  }

});

export default app;