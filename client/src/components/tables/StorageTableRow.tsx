//jedan red u tabeli

import { ArchiveDTO } from "../../models/storage/ArchiveDTO"

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
                {/* <DownloadArchiveButton url={archive.downloadUrl} /> */}
            </td>
        </tr>
    );
}