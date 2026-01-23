import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import { initialize_database } from './Database/InitializeConnection';
import dotenv from 'dotenv';
import { BackupValidationLog } from './Domain/models/BackupValidationLog';
import { Db } from './Database/DbConnectionPool';
import { ILogerService } from './Domain/services/ILogerService';
import { LogerService } from './Services/LogerService';
import { IBackupValidationService } from './Domain/services/IBackupValidationService';
import { BackupValidationService } from './Services/BackupValidationService';
import { IBackupValidationQueryService } from './Domain/services/IBackupValidationQueryService';
import { BackupValidationQueryService } from './Services/BackupValidationQueryService';
import { BackupValidationController } from './WebAPI/controllers/BackupValidationController';

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

const BACKUP_INTERVAL = 6 * 60 * 60 * 1000; // svakih sest sati

// inicijalizacija baze
void (async () => {
  await initialize_database();
  
  const backupRepo = Db.getRepository(BackupValidationLog);

  const logerService: ILogerService = new LogerService();
  const backupValidationService: IBackupValidationService = new BackupValidationService(backupRepo, logerService);
  const backupValidationQueryService: IBackupValidationQueryService = new BackupValidationQueryService(backupRepo, logerService);

  const backupController = new BackupValidationController(backupValidationService, backupValidationQueryService);

  app.use("/api/v1", backupController.getRouter());

  await backupValidationService.runValidation();

  setInterval(async () => {
    console.log("Starting automatic Backup Validation...");
    await backupValidationService.runValidation();
  }, BACKUP_INTERVAL);
  
})();

  
export default app;