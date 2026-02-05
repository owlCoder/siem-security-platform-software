export interface ServiceCheckDTO {
    id: number;
    status: string;        // "UP" ili "DOWN"
    responseTimeMs: number;
    checkedAt: string;     // Datum kao string
}