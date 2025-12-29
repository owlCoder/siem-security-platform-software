import { IParserAPI } from "../../../api/parser/IParserAPI";
import { EventRow } from "../../events/EventRow";

export interface ExpandedProps { //move into a right folders(types)
    expanded: boolean;
    e: EventRow;
    parserApi: IParserAPI;
}