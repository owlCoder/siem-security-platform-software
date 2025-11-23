import { EventDTO } from "../DTOs/EventDTO";

export type AnlysisEngineResponseType={
    success: boolean;
    eventData?: EventDTO;//ja bih dto jer njega koristimo za slanje kada komuniciramo
}