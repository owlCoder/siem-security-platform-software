import { FiDownload } from "react-icons/fi";
import { StorageAPI } from "../../api/storage/StorageAPI";
import { useAuth } from "../../hooks/useAuthHook";
import { useState } from "react";

type Props = {
    archiveId: number;
    fileName: string;
}

const storageAPI = new StorageAPI();

export default function DownloadArchiveButton({ archiveId, fileName }: Props) {
    const { token } = useAuth();
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!token || isDownloading) return;

        try {
            setIsDownloading(true);

            const data = await storageAPI.downloadArchive(/*token,*/ archiveId);
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
        //<button onClick={handleDownload} style={{backround: "none", border: "none", cursor: "pointer"}}>
        <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="cursor-pointer p-1 hover:text-white transition-colors disabled:cursor-not-allowed disabled:text-[#555]"
            title={isDownloading ? "Downloading..." : "Download archive"}>
            {isDownloading ? (
                <div className="w-4 h-4 border-2 border-[#999] border-t-transparent rounded-full animate-spin" />
            ) : (
                <FiDownload size={18} />
            )}
        </button>
    );
}