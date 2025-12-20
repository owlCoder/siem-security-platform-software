import { FiDownload } from "react-icons/fi";
import { StorageAPI } from "../../api/storage/StorageAPI";
import { useAuth } from "../../hooks/useAuthHook";

type Props = {
    archiveId: number;
    fileName: string;
}

const storageAPI = new StorageAPI();

export default function DownloadArchiveButton({ archiveId, fileName } : Props) {
    const { token } = useAuth();

    const handleDownload = async () => {
        if(!token) return;
        try{
            const data = await storageAPI.downloadArchive(archiveId, token);
            const blob = new Blob([data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download error: " + err);
        }
    }

    return (
        <button onClick={handleDownload} style={{background: "none", border: "none", cursor: "pointer"}}>
            <FiDownload size={20} />
        </button>
    );
}