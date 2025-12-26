import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { CacheEntry } from "../Domain/models/CacheEntry";
import { Event } from "../Domain/models/Event";
import { Alert } from "../Domain/models/Alert";


dotenv.config();

export const MongoDb = new DataSource({
  type: "mongodb",
  host: process.env.MONGO_HOST,
  port: Number(process.env.MONGO_PORT),
  username: process.env.MONGO_USER,
  password: process.env.MONGO_PASSWORD,
  database: process.env.MONGO_DB_NAME,
  synchronize: true,
  logging: false,
  entities: [CacheEntry],
});

export const MySQLDb = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  synchronize: true,
  logging: false,
  entities: [Event],
});

export const AlertDb = new DataSource({
  type: "mysql",
  host: process.env.ALERT_DB_HOST,
  port: Number(process.env.ALERT_DB_PORT),
  username: process.env.ALERT_DB_USER,
  password: process.env.ALERT_DB_PASSWORD,
  database: process.env.ALERT_DB_NAME,
  ssl: { rejectUnauthorized: false },
  synchronize: true,
  logging: false,
  entities: [Alert],
});
