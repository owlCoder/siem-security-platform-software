import { ILoggerService } from "../Domain/Services/ILoggerService";

export class LoggerService implements ILoggerService {
    constructor() {
        console.log(`\x1b[35m[Logger@CorrelationService]\x1b[0m Service started`);
    }

    async info(message: string, meta?: Record<string, any>): Promise<void> {
        if (meta) {
            console.info(`\x1b[34m[INFO][Logger@1.45.4]\x1b[0m ${message}`, meta);
        } else {
            console.info(`\x1b[34m[INFO][Logger@1.45.4]\x1b[0m ${message}`);
        }
    }

    async warn(message: string, meta?: unknown): Promise<void> {
        if (meta) {
            console.warn(`\x1b[33m[WARN][Logger@1.45.4]\x1b[0m ${message}`, meta);
        } else {
            console.warn(`\x1b[33m[WARN][Logger@1.45.4]\x1b[0m ${message}`);
        }
    }

    async error(message: string, meta?: unknown): Promise<void> {
        if (meta) {
            console.error(`\x1b[31m[ERROR][Logger@1.45.4]\x1b[0m ${message}`, meta);
        }
        else {
            console.error(`\x1b[31m[ERROR][Logger@1.45.4]\x1b[0m ${message}`);
        }
    }
}