import { CacheEntry } from "../models/CacheEntry";

export interface IQueryService {
    // ovde da budu definisane metode za poslovnu logiku
    // npr pretraga i preuzimanje podataka u pdf formatu
    // u IQueryRepositoryService su metode za rad sa bazom podataka
    // npr dodavanje dokumenta u bazu, dobavljanje svih event-ova, dobavljanje event-ova starijih od 72h, i 
    // provera da li postoji dokument sa odredjenim kljucem tj. da li je on vec kesiran
    // sve ostale metode idu u Utils folder
    // npr konvertovanje rezultata pretrage u JSON i obrnuto
}