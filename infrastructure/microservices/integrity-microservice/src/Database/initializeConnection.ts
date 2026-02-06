import { IntegrityDb } from "./DbConnectionPool";

export async function initialize_database() {
  try {
    await IntegrityDb.initialize();
    console.log("\x1b[34m[IntegrityDbConn@1.0.0]\x1b[0m Database connected");
  } catch (err) {
    console.error("\x1b[31m[IntegrityDbConn@1.0.0]\x1b[0m Error during DataSource initialization ", err);
  }
}