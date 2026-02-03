import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import { config } from 'dotenv';

config({ quiet: true });

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

async function startApp() {
  try {
    
    const app = express();
    app.use(express.json());
    
    
    const PORT = process.env.PORT ?? 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    
  } catch (err) {
    console.error("Failed to start app:", err);
  }
}

// Start everything
void startApp();

  
export default app;