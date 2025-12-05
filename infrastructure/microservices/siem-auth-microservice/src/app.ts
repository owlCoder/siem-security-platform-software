import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import dotenv from 'dotenv';

import { IValidationService } from './Domain/services/IValidationService';
import { ValidationService } from './Services/ValidationService';

import { AuthController } from './WebAPI/controllers/AuthController';


dotenv.config({ quiet: true });

const app = express();

app.use(express.json());

// CORS podešavanje iz .env
const corsOrigin =
  process.env.CORS_ORIGIN?.split(",").map((m) => m.trim()) ?? ["*"];

const corsMethods =
  process.env.CORS_METHODS?.split(",").map((m) => m.trim()) ??
  ["GET", "POST"];

app.use(
  cors({
    origin: corsOrigin,
    methods: corsMethods,
  }),
);

const secretJWT = proccess.env.JWT_SECRET?.split(",").map((m) => m.trim()) ?? ["*"];

const sysAdminRoleId = proccess.env.SYS_ADMIN_ROLE_ID?.split(",").map((m) => m.trim());

//Services
const validationService: IValidationService = new ValidationService(secretJWT,sysAdminRoleId);

// WebAPI routes
const authController = new AuthController(validationService);

// Registering routes
app.use('/api/v1/auth', authController.getRouter());

export default app;
