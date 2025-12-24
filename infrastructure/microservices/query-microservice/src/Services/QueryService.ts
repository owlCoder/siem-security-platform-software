import { IQueryService } from "../Domain/services/IQueryService";
import { IQueryRepositoryService } from "../Domain/services/IQueryRepositoryService";
import { parseQueryString } from "../Utils/ParseQuery";
import { EventDTO } from "../Domain/DTOs/EventDTO";
import { PdfGenerator } from "../Utils/PdfGenerator";
import { EventType } from "../Domain/enums/EventType";

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

    async searchEvents(query: string): Promise<EventDTO[]> {

        const cacheResult = await this.queryRepositoryService.findByKey(query);
        if (cacheResult.key !== "NOT_FOUND") {
            return cacheResult.result.map((e: {source: string; type: EventType; description: string; timestamp: Date; }) => ({
                source: e.source,
                type: e.type,
                description: e.description,
                timestamp: e.timestamp,
            }));
        }
        
        const allEvents = await this.queryRepositoryService.getAllEvents();

        if (query.trim() === "") {
            return allEvents.map(e => ({
                source: e.source,
                type: e.type,
                description: e.description,
                timestamp: e.timestamp,
            }));
        }
        // query je npr. "type=info|date=20/10/2025" ili "type=info|host=server1|dateFrom=2025-11-20|dateTo=2025-11-22"
        // pozivamo parseQueryString da dobijemo parove kljuc-vrednost sa nazivom polja i vrednosti za pretragu
        const filters = parseQueryString(query);

        const textQuery = filters["text"] || "";

        let filteredEvents = allEvents;

        if (textQuery !== "") {
            textQuery.trim().toLowerCase();
            /*const matchingIds = this.queryRepositoryService.findEvents(textQuery); izbacuje gresku pa je zakomentarisanno

            // ako postoji text filter i nema poklapanja to znaci da nema rezultata
            if (matchingIds.size === 0) {
                filteredEvents = [];
            } else {
                filteredEvents = allEvents.filter(event =>
                    matchingIds.has(event.id)
                );
            }*/
        }
        
        const result =  filteredEvents.filter(event => {

            for (const key of Object.keys(filters)) {
                const value = filters[key].toLowerCase();

                if (key === "dateFrom") {
                    const date = new Date(filters[key]);
                    if (new Date(event.timestamp) < date) return false;
                    continue;
                }

                if (key === "dateTo") {
                    const date = new Date(filters[key]);
                    if (new Date(event.timestamp) > date) return false;
                    continue;
                }
                
                if (key === "type") {
                    if (event.type.toLowerCase() !== value) return false;
                    continue;
                }
            }

            return true;
        }).map(e => ({
            source: e.source,
            type: e.type,
            description: e.description,
            timestamp: e.timestamp,
        }));

        this.queryRepositoryService.addEntry({
            key: query,
            result: result,
        });
        return result;
    } 

    public async generatePdfReport(query: string): Promise<string> {
        
        const eventsToReport = await this.searchEvents(query); 

        if (eventsToReport.length === 0) {
            console.warn(`No results found for query: ${query}.`);
            return ''; 
        }

        const base64PdfString = await PdfGenerator.createReport(eventsToReport); 
        
        return base64PdfString; 
    }

    // dodati logovanje za debug kad se doda LoggerService
}