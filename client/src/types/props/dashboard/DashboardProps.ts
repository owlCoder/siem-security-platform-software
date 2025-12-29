import { IQueryAPI } from "../../../api/query/IQueryAPI";
import { IStorageAPI } from "../../../api/storage/IStorageAPI";

export interface DashboardProps{
    queryApi:IQueryAPI;
    storageApi:IStorageAPI;
}