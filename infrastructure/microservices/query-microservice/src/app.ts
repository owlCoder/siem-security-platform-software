import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { initialize_database } from './Database/InitializeConnection';
//import { Repository } from 'typeorm';
import { Db } from './Database/DbConnectionPool';
import { CacheEntry } from './Domain/models/CacheEntry';
import { MongoRepository } from 'typeorm';
import { QueryRepositoryService } from './Services/QueryRepositoryService';
import { QueryService } from './Services/QueryService';
import { QueryController } from './WebAPI/controllers/QueryController';


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
const cacheRepository : MongoRepository<CacheEntry> = Db.getMongoRepository(CacheEntry);

// Servisi
const queryRepositoryService = new QueryRepositoryService(cacheRepository);
const queryService = new QueryService();

// WebAPI rute
const queryController = new QueryController(queryRepositoryService);

// Registracija ruta
app.use('/api/v1', queryController.getRouter());

export default app;
