import path from "path";

export const BACKUP_DIR = process.env.BACKUP_PATH || path.join(__dirname, "../../../backups");

export const BACKUP_FILE_NAME = "security_backup.sql";

export const SHADOW_DB_NAME = process.env.SHADOW_DB_NAME || "backup_validation_db";

export const BACKUP_SOURCES = [
    {
        name: "alerts",
        dbName: process.env.ALERT_DB_NAME!,
        tables: ["alerts"],
    },
    {
        name: "events",
        dbName: process.env.EVENT_DB_NAME,
        tables: ["event"],
    },
];

export const TABLES = ["alerts", "events"];