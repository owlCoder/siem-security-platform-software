//ovo mozemo iz event service uzeti,dok oni ne naprave ovo koristiti
export interface EventDTO {
    event_id:number;
    event_source:string;
    // event type
    event_timestamp:Date;
    message:string;
}