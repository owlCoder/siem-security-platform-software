import dotenv from "dotenv";
import { initialize_database } from "./Database/InitializeConnection";

dotenv.config();

async function main() {
  await initialize_database();
  console.log("[StatusMonitor] Started");
}

main();
