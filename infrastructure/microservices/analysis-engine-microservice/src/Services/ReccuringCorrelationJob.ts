import { IRecurringJob } from "../Domain/contracts/IRecurringJob";
import { ICorrelationService } from "../Domain/Services/ICorrelationService";

export class RecurringCorrelationJob implements IRecurringJob {

    constructor(private readonly correlationService: ICorrelationService) {}

    async execute(): Promise<void> {
        console.log(`\x1b[35m[RecurringCorrelationJob@1.0.0]\x1b[0m Executing recurring correlation job...`);
        var result = await this.correlationService.findCorrelations();
        
    }
}   