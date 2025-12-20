import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { DistributionDTO } from "../../models/query/DistributionDTO"
import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type EventDistributionProps = {
    data: DistributionDTO;
}

export default function EventDistribution({data}: EventDistributionProps){
    const chartData = [
        {name: 'Notifications', value: data.notifications, color: 'green'},
        {name: 'Warnings', value: data.warnings, color: 'orange'},
        {name: 'Errors', value: data.errors, color: 'red'},
    ];

    const containerStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
        padding: "10px"
    };

    const headerStyle: React.CSSProperties = {
        display: "flex",
        marginBottom: "8px"
    };

    const chartContainerStyle: React.CSSProperties = {
        width: "100%",
        height: "350px",
        backgroundColor: "#2b2d31",
        borderRadius: "12px",
        padding: "15px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    };

    const legendContainerStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginTop: "20px",
        width: "75%",
        maxWidth: "300px"
    };

    const legendItemStlye: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        backgroundColor: "#313338",
        borderRadius: "8px"
    };

    const legendLableStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "10px"
    };

    const legendDotStyle = (color: string): React.CSSProperties => ({
        width: "16px",
        height: "16px",
        borderRadius: "4px",
        backgroundColor: color
    });

    const legendTextStyle: React.CSSProperties = {
        fontSize: "14px",
        color: "#ffffff",
        fontWeight: 600
    };

    const legendValueStyle: React.CSSProperties = {
        fontSize: "10px",
        color: "#c5c5c5",
        fontWeight: 700
    }

    const printRef = useRef<HTMLDivElement | null>(null);

    const handleDownload = async () => {
        try{
            if(!printRef.current){
                return;
            }

            const bg = window.getComputedStyle(printRef.current).backgroundColor || "#ffffff";
            const canvas = await html2canvas(printRef.current, {scale: 2, backgroundColor: bg});
            const imgData = canvas.toDataURL("image/png");

            // pie chart
            const doc = new jsPDF({unit: "mm", format: "a4", compress: true});
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 10;
            let cursorY = margin;

            doc.setFontSize(14);
            doc.text("Event distribution", margin, cursorY + 6);
            cursorY += 10;

            const imgProps = (doc as any).getImageProperties(imgData);
            const pdfImgW = pageWidth - margin * 2;
            const pdfImgH = (imgProps.height * pdfImgW) / imgProps.width;

            if(cursorY + pdfImgH > pageHeight - margin){
                doc.addPage();
                cursorY = margin;
            }
            doc.addImage(imgData, "PNG", margin, cursorY, pdfImgW, pdfImgH);
            cursorY += pdfImgH + 8;

            // data
            doc.setFontSize(10);
            doc.text("Event ditribution(per type):", margin, cursorY + 4);
            cursorY += 6;

            doc.setFontSize(9);
            const lines = [
                `Notifications: ${data.notifications}%`,
                `Warnings: ${data.warnings}%`,
                `Errors: ${data.errors}%`,
            ];

            for(const line of lines){
                if(cursorY + 6 > pageHeight - margin){
                    doc.addPage();
                    cursorY = margin;
                }
                doc.text(line, margin + 4, cursorY + 4);
                cursorY += 6;
            }

            doc.save("event-distribution.pdf");
        } catch(err){
            console.error("PDF generation failed", err);
        }
    }

    return(
        <div style={containerStyle}>
            <div ref={printRef} style={chartContainerStyle}>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            dataKey="value">
                                {chartData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <div style={legendContainerStyle}>
                    {chartData.map((item, index) => (
                        <div key={index} style={legendItemStlye}>
                            <div style={legendLableStyle}>
                                <div style={legendDotStyle(item.color)} />
                                <span style={legendTextStyle}>{item.name}</span>
                            </div>
                            <span style={legendValueStyle}>{item.value}%</span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                    <button
                        onClick={handleDownload}
                        style={{
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: "none",
                            background: "#0078d4",
                            color: "#ffffff",
                            cursor: "pointer"
                        }}>
                            Download PDF
                    </button> 
                </div>
        </div>
    );
}