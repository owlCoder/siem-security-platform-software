import { ArchiveDTO } from "../models/storage/ArchiveDTO";
import { StorageLogResponseDTO } from "../models/storage/StorageLogResponseDTO";

export function mapToArchiveDTO(data: StorageLogResponseDTO[]): ArchiveDTO[] {
        return data.map(a => ({
            id: a.storageLogId,
            fileName: a.fileName,
            recordCount: a.recordCount,
            fileSize: a.fileSize,
            createdAt: a.createdAt,
            downloadUrl: `${import.meta.env.VITE_GATEWAY_URL}/storageLog/file/${a.storageLogId}`
    }));
}