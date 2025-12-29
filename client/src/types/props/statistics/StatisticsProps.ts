import { IQueryAPI } from "../../../api/query/IQueryAPI";
import { IStorageAPI } from "../../../api/storage/IStorageAPI";

export interface StatisticsProps{
    queryApi:IQueryAPI;
    storageApi:IStorageAPI;
}