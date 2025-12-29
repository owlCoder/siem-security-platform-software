import { IStorageAPI } from "../../../api/storage/IStorageAPI";

export interface DownloadArchiveProps {
    archiveId: number;
    fileName: string;
    storageApi: IStorageAPI;
}