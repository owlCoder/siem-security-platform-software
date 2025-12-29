import { IParserAPI } from "../../../api/parser/IParserAPI";
import { IQueryAPI } from "../../../api/query/IQueryAPI";

export interface EventsProps {
    queryApi: IQueryAPI;
    parserApi: IParserAPI;
}
