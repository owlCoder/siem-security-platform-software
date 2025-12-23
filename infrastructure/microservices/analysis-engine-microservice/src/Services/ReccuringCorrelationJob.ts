import { IRecurringJob } from "../Domain/contracts/IRecurringJob";
import { ICorrelationService } from "../Domain/Services/ICorrelationService";
import { ILoggerService } from "../Domain/Services/ILoggerService";

export class RecurringCorrelationJob implements IRecurringJob {

    constructor(private readonly correlationService: ICorrelationService, private readonly loggerService: ILoggerService) { }

    async execute(): Promise<void> {
        await this.loggerService.info(`[RecurringCorrelationJob@1.0.0][Executing recurring correlation job...`);
        await this.correlationService.findCorrelations();
    }
}   
