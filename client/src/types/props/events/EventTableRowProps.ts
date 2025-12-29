import { IParserAPI } from "../../../api/parser/IParserAPI";
import { EventRow } from "../../events/EventRow";

export interface EventTableRowProps {   //at the end,move into a right folders(types) 
    e: EventRow;
    index: number;
    parserApi: IParserAPI;
}