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

app.use(express.json());

const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods =
  process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["GET", "POST"];

app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

app.get("/health", async (req, res) => {
  try {
    await Db.query("SELECT 1");

    res.status(200).json({
      status: "OK",
      service: "StorageLogService",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (err) {
    res.status(503).json({
      status: "DOWN",
      service: "StorageLogService",
      timestamp: new Date().toISOString()
    });
  }
});

async function startApp() {
  try {
    await initialize_database();
    console.log("Database initialized successfully.");

    const storageRepo = Db.getRepository(StorageLog);

    const logerService: ILogerService = new LogerService();
    const archiveProcessService: IArchiveProcessService = new ArchiveProcessService(storageRepo, logerService);
    const archiveQueryService: IArchiveQueryService = new ArchiveQueryService(storageRepo, logerService);
    const archiveStatsService: IArchiveStatsService = new ArchiveStatsService(storageRepo, logerService);

    const storageController = new StorageLogController(
      archiveProcessService,
      archiveQueryService,
      archiveStatsService
    );

    app.use('/api/v1', storageController.getRouter());

    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    setInterval(async () => {
      console.log("Starting automatic StorageLog archiving...");
      try {
        await archiveProcessService.runArchiveProcess();
        console.log("Archiving completed.");
      } catch (err) {
        console.error("Error in archiving:", err);
      }
    }, FIFTEEN_MINUTES);

    await archiveProcessService.runArchiveProcess();
    console.log("First archiving complete.");

    const PORT = process.env.PORT ?? 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  } catch (err) {
    console.error("Failed to start app:", err);
  }
}

void startApp();

export default app;