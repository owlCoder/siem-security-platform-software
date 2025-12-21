//jedan red u tabeli

import React from "react";
import { ArchiveDTO } from "../../models/storage/ArchiveDTO"
import DownloadArchiveButton from "../storage/DownloadArchiveButton";
import { AiOutlineFileZip } from "react-icons/ai";

type Props = {
    archive: ArchiveDTO;
}

export default function StorageTableRow({archive}: Props){

    const tdStyle: React.CSSProperties = {
        padding: "14px 16px",
        borderBottom: "1px solid #2d2d2d",
        color: "#dcdcdc",
        fontSize: "14px",
        textAlign: "center"
    };

    const rowStyle: React.CSSProperties = {
        transition: "backround 0.2s",
        cursor: "pointer"
    };

    return (
        <tr
            style={rowStyle}
            onMouseEnter={e => (e.currentTarget.style.background = "#2a2a2a")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
            <td style={{...tdStyle, width: "40px"}}>
                <AiOutlineFileZip size={25} color="#d0d0d0"/>
            </td>
            <td style={tdStyle}>{archive.fileName}</td>
            <td style={tdStyle}>{new Date(archive.createdAt).toLocaleDateString()}</td>
            <td style={tdStyle}>{(archive.fileSize / 1024 / 1024).toFixed(2)} MB</td>
            <td style={tdStyle}>
                <DownloadArchiveButton archiveId={archive.id} fileName={archive.fileName} />
            </td>
        </tr>
    );
}