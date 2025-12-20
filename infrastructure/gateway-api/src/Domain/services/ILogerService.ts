export interface ILogerService {
    log(message: string): Promise<boolean>;
    error(message: string): Promise<boolean>;
}