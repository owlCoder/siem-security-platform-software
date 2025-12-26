import { MongoDb, MySQLDb, AlertDb } from "./DbConnectionPool";

export async function initialize_mongo_database() {
  try {
    await MongoDb.initialize();
    console.log("\x1b[34m[DbConn@1.12.4]\x1b[0m Mongo Database connected");

  } catch (err) {
    console.error("\x1b[31m[DbConn@1.12.4]\x1b[0m Error during DataSource initialization for Mongo", err);
  }
}

export async function initialize_mysql_database() {
  try {
    await MySQLDb.initialize();
    console.log("\x1b[34m[DbConn@1.12.4]\x1b[0m MySQL Database connected");

  } catch (err) {
    console.error("\x1b[31m[DbConn@1.12.4]\x1b[0m Error during DataSource initialization for MySQL", err);
  }
}

export async function initialize_alert_database() {
  try {
    await AlertDb.initialize();
    console.log("\x1b[34m[DbConn@1.12.4]\x1b[0m Alert Database connected");
  } catch (err) {
    console.error("\x1b[31m[DbConn@1.12.4]\x1b[0m Error during DataSource initialization for AlertDb", err);
  }
}