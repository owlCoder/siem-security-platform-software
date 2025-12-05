import {In, Repository} from "typeorm";
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
    private readonly queryClient: AxiosInstance;

    constructor(private correlationRepo: Repository<Correlation>, private correlationEventMap: Repository<CorrelationEventMap>, private readonly llmChatApiService: ILLMChatAPIService) {

        console.log(`\x1b[35m[CorrelationService@1.45.4]\x1b[0m Service started`);

        const parserServiceURL = process.env.PARSER_SERVICE_API;
        const alertServiceURL = process.env.ALERT_SERVICE_API;
        const queryServiceURL = process.env.QUERY_SERVICE_API;

        this.queryClient = axios.create({
            baseURL: queryServiceURL,
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
        });

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

        const events = await this.queryClient.get(`/query/oldEvents/1`);


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


     async sendCorrelationAlert(correlation: CorrelationDTO): Promise<void> {
        try {
            await this.alertClient.post("/alerts/correlation", {
                correlationId: correlation.id,
                description: correlation.description,
                severity: correlation.severity,
                correlatedEventIds: correlation.correlatedEventIds
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


    async deleteCorrelationsByEventIds(eventIds: number[]): Promise<number> {
        if(!eventIds || eventIds.length === 0) return 0 ;

        const maps = await this.correlationEventMap.find({
            where: { event_id: In(eventIds) }
        })

        const correlationIds = Array.from(new Set(maps.map(map => map.correlation_id)));
        if(correlationIds.length === 0) return 0 ;

        await this.correlationEventMap.delete({ correlation_id: In(correlationIds) });
        await this.correlationRepo.delete({ id: In(correlationIds) });

        console.log(`\x1b[35m[CorrelationService]\x1b[0m Deleted correlations associated with event IDs: [${eventIds.join(", ")}]`);    
        return correlationIds.length;
    }

}