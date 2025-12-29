import { IQueryService } from "../Domain/services/IQueryService";
import { IQueryRepositoryService } from "../Domain/services/IQueryRepositoryService";
import { parseQueryString } from "../Utils/ParseQuery";
import { EventDTO } from "../Domain/DTOs/EventDTO";
import { PdfGenerator } from "../Utils/PdfGenerator";
import { EventsResultDTO } from "../Domain/DTOs/EventsResultDTO";
import { EventsResult } from "../Domain/models/EventsResult";

// princip pretrage:
// imamo recnik koji mapira reci iz eventa na event id-eve
// npr. "error" => [1, 5, 7]
// npr. "server1" => [2, 3, 6]
// prilikom pretrage se parsira query string i za svaku rec iz query stringa se dobijaju id-evi iz recnika
// kao rezultat pretrage se vracaju id-evi koji se pojavljuju u barem jednom skupu za svaku rec iz query stringa
// promenljiva lastProcessedId cuva id event-a koji je poslednji procesiran
// kada se pokrene pretraga, prvo se od EventCollector servisa trazi da vrati najveci id eventa koji je sacuvan
// ukoliko je veci od lastProcessedId, znaci da ima novih event-a
// onda se ti event-i uzimaju i azurira se recnik sa njihovim podacima
// na 15 minuta se brisu eventi koji su stariji od 72h, i tada se brisu i njihovi podaci iz recnika
// imamo i mapu koja mapira event id na reci iz eventa za lakse brisanje

export class QueryService implements IQueryService {
    constructor(
        private readonly queryRepositoryService: IQueryRepositoryService,
    ) {}

    async searchEvents(query: string, page: number = 1, limit: number = 50): Promise<EventsResultDTO> {
        const cacheResult = await this.queryRepositoryService.findByKey(`${query}_p${page}_l${limit}`);
        const lastProcessedId = this.queryRepositoryService.getLastProcessedId();

        if (cacheResult.key !== "NOT_FOUND") {
            // ako su im lastProcessedId isti znaci da nije obradjen(dodat) nijedan novi event od trenutka kesiranja
            if (cacheResult.lastProcessedId === lastProcessedId)
            {
               return cacheResult.result as EventsResult;
            }
            // a ako se ne poklapaju brisemo stari kes -> rekesiranje
            this.queryRepositoryService.deleteByKey(query);
        }

        // query je npr. "type=info|date=20/10/2025" ili "type=info|host=server1|dateFrom=2025-11-20|dateTo=2025-11-22"
        // pozivamo parseQueryString da dobijemo parove kljuc-vrednost sa nazivom polja i vrednosti za pretragu
        const filters = parseQueryString(query);
        const textQuery = filters["text"] || "";
        delete filters["text"];
        
        let matchingIds: Set<number>;
        const allEvents = await this.queryRepositoryService.getAllEvents(); // Ili neka brža mapa

        if (textQuery !== "") {
            matchingIds = this.queryRepositoryService.findEvents(textQuery.trim().toLowerCase());
        } else {
            // ovde cemo getEventsById 
            matchingIds = new Set(allEvents.map(e => e.id));
        }

        const fullyFilteredEvents = allEvents.filter(event => {
            if (!matchingIds.has(event.id)) return false;

            if (filters.type && event.type.toLowerCase() !== filters.type.toLowerCase()) return false;
            
            if (filters.dateFrom) {
                const dateFrom = new Date(filters.dateFrom);
                if (new Date(event.timestamp) < dateFrom) return false;
            }

            if (filters.dateTo) {
                const dateTo = new Date(filters.dateTo);
                if (new Date(event.timestamp) > dateTo) return false;
            }

            return true;
        });

        const totalResults = fullyFilteredEvents.length;
        const paginatedEvents = fullyFilteredEvents.slice((page - 1) * limit, page * limit);

        const data: EventDTO[] = paginatedEvents.map(e => ({
            source: e.source,
            type: e.type,
            description: e.description,
            timestamp: e.timestamp,
        }));
        
        const response: EventsResultDTO = {
            total: totalResults,
            data: data,
            page,
            limit
        };

        this.queryRepositoryService.addEntry({
            key: `${query}_p${page}_l${limit}`,
            result: response as any,
            lastProcessedId: lastProcessedId,
        });

        return response;
    } 

    public async generatePdfReport(dateFrom: string, dateTo: string, eventType: string): Promise<string> {
    console.log("BACKEND PRIMIO DATUME:", { dateFrom, dateTo, eventType });
    console.log("FORMAT DATUMA:", typeof dateFrom);
        const eventsToReport = await this.queryRepositoryService.getFilteredEvents(dateFrom, dateTo, eventType); 

        if (!eventsToReport || eventsToReport.length === 0) {
            console.warn(`No results found for dates: ${dateFrom} - ${dateTo}, type: ${eventType}`);
            return ''; 
        }

        const data: EventDTO[] = eventsToReport.map(e => ({
            source: e.source,
            type: e.type,
            description: e.description,
            timestamp: e.timestamp,
        }));

        const base64PdfString = await PdfGenerator.createReport(data); 
        
        return base64PdfString; 
    }

    // dodati logovanje za debug kad se doda LoggerService
}