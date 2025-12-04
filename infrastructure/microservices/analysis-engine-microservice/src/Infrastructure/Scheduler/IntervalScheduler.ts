import { IRecurringJob } from "../../Domain/contracts/IRecurringJob";

export class IntervalScheduler {
    constructor(private readonly job: IRecurringJob, private readonly intervalMs: number) {}

    public start(): void {
        console.log(`\x1b[35m[IntervalScheduler]\x1b[0m Starting interval scheduler with interval ${this.intervalMs} ms`);
        setInterval(async () => {
            console.log(`\x1b[35m[IntervalScheduler]\x1b[0m Triggering scheduled job...`);
            await this.job.execute();
        }, this.intervalMs);
    }
}