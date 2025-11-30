import { IQueryService } from "../Domain/services/IQueryService";
import { IQueryRepositoryService } from "../Domain/services/IQueryRepositoryService";
import { Event } from "../Domain/models/Event";
import { parseQueryString } from "../Utils/ParseQuery";

export class QueryService implements IQueryService {
    constructor(
        private readonly queryRepositoryService: IQueryRepositoryService,
    ) {}

    async searchEvents(query: string): Promise<any[]> {
        const allEvents = await this.queryRepositoryService.getAllEvents();

        // query je npr. "type=info|date=20/10/2025" ili "type=info|host=server1|dateFrom=2025-11-20|dateTo=2025-11-22"
        // pozivamo parseQueryString da dobijemo parove kljuc-vrednost sa nazivom polja i vrednosti za pretragu
        const filters = parseQueryString(query);

        // dodaj pre vracanja kesiranje
        return allEvents.filter(event => {

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
                
                // za event proverava polja sa nazivom trenutnog key
                // npr. event[type] ili event[host]
                // da li sadrzi vrednost iz query stringa
                // ako ne sadrzi takvo polje onda stavljamo da event za to polje "ima" vrednost ""
                const eventValue = (event as any)[key]?.toString().toLowerCase() || "";
                if (!eventValue.includes(value)) {
                    return false;
                }

                // proveriti da li je sve pokriveno
                // date range je pokriven
                // a proveriti da li poslednja provera ispravno proverava sva ostala polja
            }

            return true;
        });
    }
    
}