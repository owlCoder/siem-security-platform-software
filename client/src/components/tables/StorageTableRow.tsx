//jedan red u tabeli
import { IStorageAPI } from "../../api/storage/IStorageAPI";
import { ArchiveDTO } from "../../models/storage/ArchiveDTO"
import DownloadArchiveButton from "../storage/DownloadArchiveButton";
import { AiOutlineFileZip } from "react-icons/ai";

type Props = {
    archive: ArchiveDTO;
    storageApi: IStorageAPI;
}

export default function StorageTableRow({ archive, storageApi }: Props) {

    const tdClass = "px-4! py-1! text-center text-[#dcdcdc] text-[14px] border-b-[1px] border-b-[#2d2d2d]"

    return (
        <tr className="transition-colors duration-200 cursor-pointer hover:bg-[#2a2a2a]">
            <td className={`${tdClass} w-[40px]`}>
                <AiOutlineFileZip size={28} className="text-[#d0d0d0]" />
            </td>
            <td className={tdClass}>{archive.fileName}</td>
            <td className={tdClass}>{new Date(archive.createdAt).toLocaleDateString()}</td>
            <td className={tdClass}>{(archive.fileSize / 1024 / 1024).toFixed(2)} MB</td>
            <td className={tdClass}>
                <DownloadArchiveButton archiveId={archive.id} fileName={archive.fileName} storageApi={storageApi} />
            </td>
        </tr>
    );
}