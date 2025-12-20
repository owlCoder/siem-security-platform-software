import path from "path";

export const ARCHIVE_RETENTION_HOURS = 72;

export const ARCHIVE_DIR = process.env.ARCHIV_PATH || path.join(__dirname, "../../../archives");

export const TEMP_DIR = path.join(ARCHIVE_DIR, "tmp");