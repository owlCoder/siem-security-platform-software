import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import { initialize_database } from './Database/InitializeConnection';
import dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { StorageLog } from './Domain/models/StorageLog';
import { Db } from './Database/DbConnectionPool';
import { StorageLogService } from './Services/StorageLogService';
import axios from 'axios';
import { StorageLogController } from './WebAPI/controllers/StorageLogController';
import { IStorageLogService } from './Domain/services/IStorageLogService';

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["GET", "POST"];

// Protected microservice from unauthorized access
app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

app.use(express.json());

initialize_database();

const storageRepo = Db.getRepository(StorageLog);

const storageLogService : IStorageLogService = new StorageLogService(
  storageRepo,
  axios, //event
  axios //correaltion
);

const storageController = new StorageLogController(storageLogService);

app.use("/api/v1/storageLog", storageController.getRouter());


//pokretanje na svakih 15 minuta
const FIFTEEN_MINUTES = 15 * 60 * 1000;

setInterval(async () => {
  console.log("Starting automatic StorageLog archiving...");

  try{
    await storageLogService.runArchiveProcess();
    console.log("Archiving completed.");
  } catch (err){
    console.error("Error in archiving: ", err);
  }
}, FIFTEEN_MINUTES);

//odmah pokrene jednom kada servis startuje
storageLogService.runArchiveProcess()
  .then(() => console.log("First archiving complete."))
  .catch(err => console.error("Error while first archiving: ", err));
  
export default app;