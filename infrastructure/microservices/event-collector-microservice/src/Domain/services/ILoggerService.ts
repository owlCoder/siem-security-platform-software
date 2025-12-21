export interface ILoggerService {
    log(message: string): Promise<boolean>;
}
