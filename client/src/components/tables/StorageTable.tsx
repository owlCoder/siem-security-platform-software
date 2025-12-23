//tabela arhiva
import { ArchiveDTO } from "../../models/storage/ArchiveDTO"
import StorageTableRow from "./StorageTableRow";

type Props = {
    archives: ArchiveDTO[];
}

export default function StorageTable({ archives }: Props) {
    const containerStyle: React.CSSProperties = {
        background: "#1f1f1f",
        border: "2px solid #333",
        borderRadius: "14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
        overflow: "hidden",
        marginTop: "20px",
        margin:"5px"
    };

    const tableStyle: React.CSSProperties = {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px"
    };

    const theadStyle: React.CSSProperties = {
        background: "#2a2a2a"
    };

    const thStyle: React.CSSProperties = {
        textAlign: "center",
        padding: "14px 16px",
        borderBottom: "1px solid #3a3a3a",
        color: "#d0d0d0",
        fontSize: "13px",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    };

    return (
        <div style={containerStyle}>
            <table style={tableStyle}>
                <thead style={theadStyle}>
                    <tr>
                        <th style={thStyle}></th>
                        <th style={thStyle}>Archive name</th>
                        <th style={thStyle}>Time</th>
                        <th style={thStyle}>Size</th>
                        <th style={thStyle}>Download</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        archives.length === 0 ? (
                            <tr>
                                <td colSpan={4}
                                    style={{
                                        padding: "40px",
                                        textAlign: "center",
                                        color: "#a6a6a6"
                                    }}>
                                    No archives found
                                </td>
                            </tr>
                        ) : (
                            archives.map(a => (
                                <StorageTableRow key={a.id} archive={a} />
                            ))
                        )}
                </tbody>
            </table>
        </div>
    );
}