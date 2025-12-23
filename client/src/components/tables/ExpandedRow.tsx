import { EventRow } from "../../types/events/EventRow";

interface ExpandedProps { //move into a right folders(types)
    expanded: boolean;
    e: EventRow;
}

export function ExpandedRow({ expanded, e }: ExpandedProps) {

    const expandedContainerStyle = (expanded: boolean): React.CSSProperties => ({
        overflow: "hidden",                             //pomjerice se styles kasnije kad zavrsimo u poseban fajl
        transition: "height 0.3s ease",
        backgroundColor: "#292929", // gray-700
        height: expanded ? "200px" : "0px",
    });

    const expandedContentStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    };

    const detailRowStyle: React.CSSProperties = {
        display: "flex",
        justifyContent: "center",
    };

    const labelStyle: React.CSSProperties = {
        width: "16%", // w-1/6
        fontWeight: 600,
        color: "#d1d5db",
        padding: "10px"
    };

    const valueStyle: React.CSSProperties = {
        width: "330px", // w-4/6
        backgroundColor: "#1f1f1f", // gray-800
        border: "1px solid #4b5563", // border-gray-600
        borderRadius: "15px",
        padding: "10px",
        paddingLeft: "10px",
        color: "#e5e7eb", // gray-200
    };

    const detailsHeaderStyle: React.CSSProperties = {
        textAlign: "center",
        fontSize: "22px",
        fontWeight: 500,
        marginBottom: "15px",
        marginTop: "5px",
        color: "white",
    };
    return (
        <>
            <tr>
                <td colSpan={4} style={{ padding: 0 }}>
                    <div style={expandedContainerStyle(expanded)}>
                        <div style={expandedContentStyle}>
                            <h4 style={detailsHeaderStyle}>Details</h4>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
                                <div style={detailRowStyle}>
                                    <span style={labelStyle}>Source:</span>
                                    <span style={valueStyle}>{e.source}</span>
                                </div>

                                <div style={detailRowStyle}>
                                    <span style={labelStyle}>Description:</span>
                                    <span style={{ ...valueStyle, marginLeft: "25px" }}>{e.description}</span>
                                </div>

                                <div style={detailRowStyle}>
                                    <span style={labelStyle}>Type:</span>
                                    <span style={{ ...valueStyle, marginLeft: "-15px" }}>{e.type}</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </td>
            </tr>
        </>
    )
}