import React, { useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FiDownload } from "react-icons/fi";
import { StatisticsChartProps } from "../../types/props/statistics/StatisticsChartProps";


export default function StatisticsChart({eventData, alertData}: StatisticsChartProps) {
    const [showEvents, setShowEvents] = useState(true);
    const [showAlerts, setShowAlerts] = useState(true);

    const combinedData = eventData.map((event, index) => ({
        date: event.date,
        events: event.count,
        alerts: alertData[index]?.count || 0,
    }));

    const containerStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
        padding: "16px"
    };

    const headerStyle: React.CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
    };

    const chartContainerStyle: React.CSSProperties = {
        width: "100%",
        height: "350px",
        borderRadius: "12px",
        padding: "20px",
    };

    const buttonStyle = (isActive: boolean): React.CSSProperties => ({
        cursor: "pointer",
        fontWeight: "bold",
        borderRadius: "10px",
        padding: "8px 20px",
        backgroundColor: isActive ? "#007a55" : '#313338',
    });

    const printRef = useRef<HTMLDivElement | null>(null);

    const handleDownload = async () => {
        try{
            if(!printRef.current){
                return;
            }

            const bg = window.getComputedStyle(printRef.current).backgroundColor || "#ffffff";
            const canvas = await html2canvas(printRef.current, {scale: 2, backgroundColor: bg});
            const imgData = canvas.toDataURL("image/png");

            // graf
            const doc = new jsPDF({unit: "mm", format: "a4", compress: true});
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 10;
            let cursorY = margin;

            doc.setFontSize(14);
            doc.text("Events per day", margin, cursorY + 6);
            cursorY += 10;

            const imgProps = (doc as any).getImageProperties(imgData);
            const pdfImgW = pageWidth - margin * 2;
            const pdfImgH = (imgProps.height * pdfImgW) / imgProps.width;

            if(cursorY + pdfImgH > pageHeight - margin){
                doc.addPage();
                cursorY = margin;
            }
            doc.addImage(imgData, "PNG", margin, cursorY, pdfImgW, pdfImgH);
            cursorY += pdfImgH + 6;

            // data
            doc.setFontSize(10);
            doc.text("Data (date - events / alerts):", margin, cursorY + 4);
            cursorY += 6;

            doc.setFontSize(9);
            const lineHeight = 5;
            const dataToPrint = combinedData;

            for(const row of dataToPrint){
                if(cursorY + lineHeight > pageHeight - margin){
                    doc.addPage();
                    cursorY = margin;
                }

                const line = `${row.date} - events: ${row.events} / alerts: ${row.alerts}`;
                doc.text(line, margin + 4, cursorY + 4);
                cursorY += lineHeight;
            }

            doc.save("statistics-chart.pdf");
        } catch(err){
            console.error("PDF generation failed", err);
        }
    }

    return(
        <div style={containerStyle}>
            <div style={headerStyle}>
                <span style={{color: "#ffffff", fontSize: "18px", fontWeight: 600}}>
                    Events per day
                </span>

                <div style={{display: "flex", gap: 8}}>
                    <button
                        onClick={() => setShowEvents(!showEvents)}
                        style={buttonStyle(showEvents)}> Events</button>
    
                    <button
                        onClick={() => setShowAlerts(!showAlerts)}
                        style={buttonStyle(showAlerts)}> Alerts</button>

                    <button
                        onClick={handleDownload}
                        style={buttonStyle(true)}
                        title="Download chart as pdf">
                        <FiDownload size={20} />
                    </button>
                </div>
            </div>

            <div ref={printRef} style={chartContainerStyle}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={combinedData}
                        margin={{bottom: 20, right: 30}}>
                            <defs>
                                <linearGradient id="eventGradColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#007a55" stopOpacity={0.4}/>
                                    <stop offset="75%" stopColor="#007a55" stopOpacity={0.05}/>
                                </linearGradient>
                                <linearGradient id="alertGradColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#4A9DAE" stopOpacity={0.4}/>
                                    <stop offset="75%" stopColor="#4A9DAE" stopOpacity={0.05}/>
                                </linearGradient>
                            </defs>

                            <XAxis dataKey="date" style={{fontSize: "13px", fontWeight: "bold"}} axisLine={false} tickLine={false} tick={{fill: "#ffffff"}} tickMargin={10} />
                            <YAxis style={{fontSize: "13px", fontWeight: "bold"}} axisLine={false} tickLine={false} tickCount={5} tick={{fill: "#ffffff"}} tickMargin={10} />

                            {showEvents && (
                                <Area
                                    type="monotone"
                                    dataKey="events"
                                    stroke="#007a55"
                                    fill="url(#eventGradColor)"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeWidth={5}
                                    dot={false}
                                />
                            )}
                            {showAlerts && (
                                <Area
                                    type="monotone"
                                    dataKey="alerts"
                                    stroke="#4A9DAE"
                                    fill="url(#alertGradColor)"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeWidth={5}
                                    dot={false}
                                />
                            )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}