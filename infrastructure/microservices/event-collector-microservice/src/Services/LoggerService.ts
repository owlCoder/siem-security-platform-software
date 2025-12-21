import { ILoggerService } from "../Domain/services/ILoggerService";

export class LoggerService implements ILoggerService {
    constructor() {
        console.log("\x1b[35m[Logger@EventCollector]\x1b[0m Service started");
    }

    async log(message: string): Promise<boolean> {
        console.log(`\x1b[35m[Logger@EventCollector]\x1b[0m ${message}`);
        return true;
    }
}
