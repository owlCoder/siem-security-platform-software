import React from 'react';
import { TopArchiveDTO } from "../../models/storage/TopArchiveDTO";

type TopArchivesProps = {
    data: TopArchiveDTO[];
    type: "events" | "alerts";
    onTypeChange: (type: "events" | "alerts") => void;
};

export default function TopArchives( {data, type, onTypeChange}: TopArchivesProps) {
    const containerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%'
    };

    const switchContainerStyle: React.CSSProperties = {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        marginBottom: '12px'
    };

    const switchButtonStyle = (isActive: boolean): React.CSSProperties => ({
        padding: '8px 24px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: isActive ? "#0078d4" : '#313338',
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        transition: 'all 0.2s ease'
    });

    const tableStyle: React.CSSProperties = {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: '#2b2d31',
        borderRadius: '8px',
        overflow: 'hidden'
    };

    const thStyle: React.CSSProperties = {
        padding: '12px',
        textAlign: 'left',
        backgroundColor: '#1e1f22',
        color: '#c5c5c5',
        fontSize: '14px',
        fontWeight: 600,
        borderBottom: '2px solid #313338'
    };

    const tdStyle: React.CSSProperties = {
        padding: '12px',
        color: '#ffffff',
        fontSize: '14px',
        borderBottom: '1px solid #313338'
    };

    const emptyStateStyle: React.CSSProperties = {
        textAlign: 'center',
        padding: '32px',
        color: '#c5c5c5',
        fontSize: '14px'
    };
    
    return (
        <div style={containerStyle}>
            <div style={switchContainerStyle}>
                <button
                    style={switchButtonStyle(type === "events")}
                    onClick={() => onTypeChange("events")}>
                        Events
                </button>
                <button
                    style={switchButtonStyle(type === "alerts")}
                    onClick={() => onTypeChange("alerts")}>
                        Alerts
                </button>
            </div>

            {data.length > 0 ? (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={{ ...thStyle, width: '10%'}}>ID</th>
                            <th style={{ ...thStyle, width: '60%'}}>File name</th>
                            <th style={{ ...thStyle, width: '30%', textAlign: 'right'}}>
                                {type === "events" ? "Event count" : "Alert count"}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((archive, index) => (
                            <tr key={archive.id}>
                                <td style={tdStyle}>{index + 1}</td>
                                <td style={tdStyle}>{archive.fileName}</td>
                                <td style={{...tdStyle, textAlign: 'right', fontWeight: 600}}>
                                    {archive.count}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div style={emptyStateStyle}>
                    No archives found
                </div>
            )}
        </div>
    );
}
