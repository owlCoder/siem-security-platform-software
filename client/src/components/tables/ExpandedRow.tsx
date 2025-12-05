interface EventRow { //move into a right folders(types)
    id: string;
    time: string;
    type: "Info" | "Warning" | "Error";
}
interface ExpandedProps{ //move into a right folders(types)
    expanded:boolean;
    e:EventRow;
}

export function ExpandedRow({expanded,e}:ExpandedProps){
    
    const expandedContainerStyle = (expanded: boolean): React.CSSProperties => ({ 
        overflow: "hidden",                             //pomjerice se styles kasnije kad zavrsimo u poseban fajl
        transition: "height 0.3s ease",
        backgroundColor: "#373737ff", // gray-700
        height: expanded ? "300px" : "0px",
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
        padding: "14px"
    };

    const valueStyle: React.CSSProperties = {
        width: "66.6667%", // w-4/6
        backgroundColor: "#1f1f1f", // gray-800
        border: "1px solid #4b5563", // border-gray-600
        borderRadius: "8px",
        padding: "12px",
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

                            <div style={detailRowStyle}>
                                <span style={labelStyle}>Event ID:</span>
                                <span style={{ ...valueStyle, paddingLeft: "16px" }}>{e.id}</span>
                            </div>

                            <div style={detailRowStyle}>
                                <span style={labelStyle}>Source:</span>
                                <span style={valueStyle}>ovde ide source od eventa</span>
                            </div>

                            <div style={detailRowStyle}>
                                <span style={labelStyle}>Description:</span>
                                <span style={valueStyle}>ovde ide description</span>
                            </div>

                            <div style={detailRowStyle}>
                                <span style={labelStyle}>Raw Message:</span>
                                <span style={valueStyle}>Ovde ide raw message</span>
                            </div>

                        </div>
                    </div>
                </td>
            </tr>
        </>
    )
}