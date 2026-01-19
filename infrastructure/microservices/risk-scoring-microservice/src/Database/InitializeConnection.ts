import { MySQLDb } from "./DbConnectionPool";

export async function initialize_mysql_database() {
  try {
    await MySQLDb.initialize();
    console.log("\x1b[34m[DbConn@1.12.4]\x1b[0m MySQL Database connected");

  } catch (err) {
    console.error("\x1b[31m[DbConn@1.12.4]\x1b[0m Error during DataSource initialization for MySQL", err);
  }
}