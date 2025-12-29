import { QueryAlertRepositoryService } from "../Services/QueryAlertRepositoryService";

export class InvertedIndexStructureForAlerts{
    private invertedInex: Map<string, Set<number>> = new Map();
    private eventIdToTokens: Map<number, string[]> = new Map();

    constructor(private readonly queryAlertRepositoryService: QueryAlertRepositoryService){
        
    }
}