    // ovde da budu definisane metode za poslovnu logiku
    // npr pretraga i preuzimanje podataka u pdf formatu
    // u IQueryRepositoryService su metode za rad sa bazom podataka
    // npr dodavanje dokumenta u bazu, dobavljanje svih event-ova, dobavljanje event-ova starijih od 72h, i 
    // provera da li postoji dokument sa odredjenim kljucem tj. da li je on vec kesiran
    // sve ostale metode idu u Utils folder
    // npr konvertovanje rezultata pretrage u JSON i obrnuto

import { EventsResultDTO } from "../DTOs/EventsResultDTO";
import { DistributionDTO } from "../DTOs/DistributionDTO";

export interface IQueryService {
    searchEvents(query: string, page?: number, limit?: number): Promise<EventsResultDTO>;
    generatePdfReport(dateFrom: string, dateTo: string, eventType: string): Promise<string>;
    generateAlertsPdfReport(severity: string, status?: string, source?: string, dateFrom?: string, dateTo?: string): Promise<string>;
    getEventDistribution(): Promise<DistributionDTO>
}   