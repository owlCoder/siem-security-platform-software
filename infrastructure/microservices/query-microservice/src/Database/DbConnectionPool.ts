import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { CacheEntry } from "../Domain/models/CacheEntry";

dotenv.config();

export const Db = new DataSource({
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
