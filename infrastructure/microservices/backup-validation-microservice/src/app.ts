import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import { initialize_database } from './Database/InitializeConnection';
import dotenv from 'dotenv';
import { StorageLog } from './Domain/models/StorageLog';
import { Db } from './Database/DbConnectionPool';
import { StorageLogController } from './WebAPI/controllers/StorageLogController';
import { ILogerService } from './Domain/services/ILogerService';
import { LogerService } from './Services/LogerService';
import { IArchiveProcessService } from './Domain/services/IArchiveProcessService';
import { ArchiveProcessService } from './Services/ArchiveProcessService';
import { IArchiveQueryService } from './Domain/services/IArchiveQueryService';
import { ArchiveQueryService } from './Services/ArchiveQueryService';
import { IArchiveStatsService } from './Domain/services/IArchiveStatsService';
import { ArchiveStatsService } from './Services/ArchiveStatsService';

dotenv.config({ quiet: true });

const app = express();

//parsiranje JSON body-ja
app.use(express.json());

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["GET", "POST"];

// Protected microservice from unauthorized access
app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));


// inicijalizacija baze
void (async () => {
  await initialize_database();
})();

const storageRepo = Db.getRepository(StorageLog);

const logerService : ILogerService = new LogerService();
const archiveProcessService: IArchiveProcessService = new ArchiveProcessService(storageRepo, logerService);
const archiveQueryService: IArchiveQueryService = new ArchiveQueryService(storageRepo, logerService);
const archiveStatsService: IArchiveStatsService = new ArchiveStatsService(storageRepo, logerService);

const storageController = new StorageLogController(archiveProcessService, archiveQueryService, archiveStatsService);

app.use("/api/v1", storageController.getRouter());


//pokretanje na svakih 15 minuta
const FIFTEEN_MINUTES = 15 * 60 * 1000;

setInterval(async () => {
  console.log("Starting automatic StorageLog archiving...");

  try{
    await archiveProcessService.runArchiveProcess();
    console.log("Archiving completed.");
  } catch (err){
    console.error("Error in archiving: ", err);
  }
}, FIFTEEN_MINUTES);

//odmah pokrene jednom kada servis startuje
archiveProcessService.runArchiveProcess()
  .then(() => console.log("First archiving complete."))
  .catch(err => console.error("Error while first archiving: ", err));
  
export default app;