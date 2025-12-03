import {IntegerType, Repository} from "typeorm";
import { ICorrelationService } from "../Domain/Services/ICorrelationService";
import { Correlation } from "../Domain/models/Correlation";
import { CorrelationEventMap } from "../Domain/models/CorrelationEventMap";
import axios, { AxiosInstance } from "axios";
import { ILLMChatAPIService } from "../Domain/Services/ILLMChatAPIService";
import { CorrelationDTO } from "../Domain/types/CorrelationDTO";
import { mapLLMResponseToCorrelationDTO } from "../Application/mappers/mapLLMResponseToCorrelationDTO";

export class CorrelationService implements ICorrelationService{

    
    private readonly parserClient: AxiosInstance;
    private readonly alertClient: AxiosInstance;

    constructor(private correlationRepo: Repository<Correlation>, private correlationEventMap: Repository<CorrelationEventMap>, private readonly llmChatApiService: ILLMChatAPIService) {

        console.log(`\x1b[35m[CorrelationService@1.45.4]\x1b[0m Service started`);

        const parserServiceURL = process.env.PARSER_SERVICE_API;
        const alertServiceURL = process.env.ALERT_SERVICE_API;

        this.parserClient = axios.create({
            baseURL: parserServiceURL,
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
        });

        this.alertClient = axios.create({
            baseURL: alertServiceURL,
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
        });
    }
    

    async findCorrelations(): Promise<void> {
        console.log(`\x1b[35m[CorrelationService]\x1b[0m Finding correlations...`);

        const events: any[] = [];

        const correlationDTO = mapLLMResponseToCorrelationDTO(
            await this.llmChatApiService.sendCorrelationPrompt(JSON.stringify(events))
        );

        const isValid =
            correlationDTO.correlationDetected &&
            correlationDTO.confidence >= 0.51;

        if (!isValid) {
            console.log(`\x1b[33m[CorrelationService]\x1b[0m No valid correlation detected.`);
            return;
        }

        const correlationID = await this.saveCorrelation(correlationDTO);
        correlationDTO.id = correlationID;

        await this.sendCorrelationAlert(correlationDTO);

        console.log(
            `\x1b[32m[CorrelationService]\x1b[0m Correlation processed (ID=${correlationID}).`
        );
    }


    private async sendCorrelationAlert(correlation: CorrelationDTO): Promise<void> {
        try {
            await this.alertClient.post("/AlertService/createAlertFromCorrelation", {
                correlation
            });
            console.log(
                `\x1b[35m[CorrelationService]\x1b[0m Notified Alert service for correlation ID ${correlation.id}`
            );
        } catch (error) {
            console.error(
                `\x1b[31m[CorrelationService]\x1b[0m Failed to notify Alert service for correlation ID ${correlation.id}: ${(error as Error).message}`
            );
        }
    }


    async saveCorrelation(correlationData: CorrelationDTO): Promise<number> {
        const newCorrelation = this.correlationRepo.create({
            description: correlationData.description,
            timestamp: correlationData.timestamp,
            isAlert: correlationData.correlationDetected,
        });

        const savedCorrelation = await this.correlationRepo.save(newCorrelation);

        const eventMaps = correlationData.correlatedEventIds.map(eventId =>
                    this.correlationEventMap.create({
                        correlation_id: savedCorrelation.id,
                        event_id: eventId,
                    }));
                    

        await this.correlationEventMap.save(eventMaps);


        return savedCorrelation.id;
    }


    async deleteArchivedCorrelations(): Promise<void> {
        throw new Error("Method not implemented.");
    }

}