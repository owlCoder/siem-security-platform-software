import { ParseResult } from "./ParseResult";

export type EventParser = (message: string) => ParseResult;     // Function type for all parser functions