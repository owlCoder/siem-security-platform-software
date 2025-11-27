import { Event } from "../models/Event";

export type ParseResult = {
    doesMatch: boolean;
    event?: Event;
}