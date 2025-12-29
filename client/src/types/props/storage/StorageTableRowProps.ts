import { IStorageAPI } from "../../../api/storage/IStorageAPI";
import { ArchiveDTO } from "../../../models/storage/ArchiveDTO";

export interface StorageTableRowProps  {
    archive: ArchiveDTO;
    storageApi: IStorageAPI;
}