//jedan red u tabeli

import { ArchiveDTO } from "../../models/storage/ArchiveDTO"
import DownloadArchiveButton from "../storage/DownloadArchiveButton";

type Props = {
    archive: ArchiveDTO;
}

export default function StorageTableRow({archive}: Props){
    return (
        <tr>
            <td>{archive.fileName}</td>
            <td>{new Date(archive.createdAt).toLocaleDateString()}</td>
            <td>{archive.fileSize}</td>
            <td>
                <DownloadArchiveButton archiveId={archive.id} fileName={archive.fileName} />
            </td>
        </tr>
    );
}