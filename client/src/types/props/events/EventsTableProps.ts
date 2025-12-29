import { IParserAPI } from "../../../api/parser/IParserAPI";
import { EventRow } from "../../events/EventRow";

export interface EventsTableProps {
    events: EventRow[],
    sortType?: number,
    searchText?: string
    parserApi: IParserAPI,
}