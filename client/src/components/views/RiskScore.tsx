import { useEffect, useRef, useState } from "react";
import { IRiskScoreAPI } from "../../api/risk-score/IRiskScoreAPI";
import { RiskEntityType } from "../../enums/RiskEntityType";
import RiskScoreCard from "../risk-score/RiskScoreCard";
import TrendGraph from "../risk-score/TrendGraph";
import GraphParametersSelect from "../risk-score/GraphParametersSelect";
import { IQueryAPI } from "../../api/query/IQueryAPI";
import GlobalScoreGauge from "../risk-score/GlobalScoreGauge";
import { FiDownload } from "react-icons/fi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type RiskScoreProps = {
  riskScoreApi: IRiskScoreAPI;
  queryApi: IQueryAPI;
};

export default function RiskScore({ riskScoreApi, queryApi }: RiskScoreProps) {
    //const { token } = useAuth();
    const token = "sdasda";
    const [entityType, setEntityType] = useState<RiskEntityType>(RiskEntityType.SERVICE);
    const [entityId, setEntityId] = useState<string>("");
    const [entityOptions, setEntityOptions] = useState<string[]>([]); 
    const [period, setPeriod] = useState<number>(24);

    const [globalScore, setGlobalScore] = useState<number>(0);
    const [latestScore, setLatestScore] = useState<number>(0);

    const [history, setHistory] = useState<{score: number, createdAt: Date}[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async() => {
            setIsLoading(true);

            try {
                const result = await riskScoreApi.getScoreHistory(token, entityType, entityId, period);
                //console.log("history ", result);
                if (result)
                    setHistory(
                        result.map(h => ({
                            score: h.score,
                            createdAt: h.createdAt
                        }))
                    );

                const score = await riskScoreApi.getGlobalScore(token);
                //console.log("global score ", score);
                if (score)
                    setGlobalScore(score);

                const latestScore = await riskScoreApi.getLatestScore(token, entityType, entityId);
                if (latestScore)
                    setLatestScore(latestScore);
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchEntityOptions = async () => {
            try {
                let options: string[] = [];
                if (entityType === RiskEntityType.SERVICE) {
                    options = await queryApi.getUniqueServices(token) || [];
                    //console.log(options);
                } else if (entityType === RiskEntityType.IP_ADDRESS) {
                    options = await queryApi.getUniqueIps(token) || [];
                    //console.log(options);
                }
                
                if (Array.isArray(options)) {
                    setEntityOptions(options);
                    if (options.length > 0 && !entityId) { 
                        setEntityId(options[0]);
                    }
                } else {
                    console.error("API did not return an array:", options);
                    setEntityOptions([]);
                }
            } catch (error) {
                console.log(error);
                setEntityOptions([]);
            }
        };

        fetchEntityOptions();

        fetchData();

        const interval = setInterval(fetchData, 10_000);

        // cleanup funkcija 
        return () => clearInterval(interval);
    }, [token, entityType, entityId, period, riskScoreApi]);

    const printRef = useRef<HTMLDivElement | null>(null);
    const handleDownload = async () => {
    if (!printRef.current) return;

    try {
        const canvas = await html2canvas(printRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#1f2123",
            onclone: (clonedDoc) => {
                const container = clonedDoc.querySelector('.grid-cols-10') as HTMLElement;
                if (container) {
                    container.style.padding = "10px"; 
                    container.style.height = "auto";
                }

                const elements = clonedDoc.querySelectorAll('*');
                elements.forEach((el) => {
                    if (el instanceof HTMLElement) {
                        const style = window.getComputedStyle(el);
                        
                        if (style.backgroundColor.includes('oklch')) {
                            el.style.backgroundColor = '#1f2123'; 
                        }
                        if (style.color.includes('oklch')) {
                            el.style.color = '#ffffff'; 
                        }
                        if (style.borderColor.includes('oklch')) {
                            el.style.borderColor = '#282A28'; 
                        }

                        if (["GOOD", "WARNING", "CRITICAL"].includes(el.innerText.trim())) {
                            el.style.transform = "translateY(5px)"; 
                            el.style.display = "block";
                            el.style.textAlign = "center";
                        }
                    }
                });
            }
        });

        const imgData = canvas.toDataURL("image/png");
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
        });

        const pdfWidth = doc.internal.pageSize.getWidth();
        const imgWidth = pdfWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const margin = 10;
        let cursorY = margin;
        doc.setFontSize(14);
        doc.text("Risk score report", margin, cursorY + 6);

        cursorY += 15;
        doc.addImage(imgData, "PNG", margin, cursorY, imgWidth, imgHeight);
        doc.save(`risk-score-report.pdf`);
    } catch (err) {
        console.error("PDF Export Error:", err);
    }
};

    return (
        <div className="bg-transparent border-2 border-solid rounded-[14px] border-[#282A28]">
            <h2 className="mt-[3px]! p-[5px]! m-[10px]!" >Risk Score</h2>
            <div className="flex justify-end me-[10px]!" >
                <div className={`flex w-[150px]! items-center gap-2 px-3! py-1.5! rounded-[8px] text-[12px] font-semibold
            ${!isLoading
                        ? "bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.3)]"
                        : "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]"
                    }`}>
                    <div
                        className={`w-2 h-2 rounded-[14px]! ${!isLoading ? "bg-[#4ade80] animate-pulse" : "bg-[#f87171] animate-none"}`}
                    ></div>
                    {!isLoading ? "Live Updates Active" : "Connecting..."}
                </div>

            </div>
            <div className="flex gap-2 flex-shrink-0 m-[10px]! justify-end items-center">
                <div className="flex flex-col gap-[4px]">
                    <label className="px-1! block text-[11px] text-gray-400 mb-1 uppercase tracking-wider font-semibold">Entity Type</label>
                    <GraphParametersSelect
                        value={entityType}
                        onChange={(v) => {setEntityType(v as RiskEntityType); setEntityId(""); setLatestScore(0);}}
                        options={[
                            { label: "Service", value: RiskEntityType.SERVICE },
                            { label: "IP Address", value: RiskEntityType.IP_ADDRESS },
                        ]}
                    />
                </div>

                <div className="flex flex-col gap-[4px]">
                    <label className="px-1! block text-[11px] text-gray-400 mb-1 uppercase tracking-wider font-semibold">Entity Value</label>
                    <GraphParametersSelect
                        value={entityId}
                        onChange={(e) => setEntityId(String(e))}
                        options={entityOptions.map(element => ({
                            label: element,
                            value: element,
                        }))}
                    />
                </div>

                <div className="flex flex-col gap-[4px]">
                    <label className="px-1! block text-[11px] text-gray-400 mb-1 uppercase tracking-wider font-semibold">Period</label>
                    <GraphParametersSelect
                        value={period}
                        onChange={(v) => setPeriod(Number(v))}
                        options={[
                            { label: "24 hours", value: 24 },
                            { label: "7 days", value: 24*7 },
                        ]}
                    />
                </div>

                <div className="flex flex-col gap-[4px]">
                    <label className="px-1! block text-[11px] text-[#1f2123] mb-1 uppercase tracking-wider font-semibold">-</label>
                    <button
                        onClick={handleDownload}
                        className="px-4! py-2! rounded-[10px]! bg-[#007a55] transition-all duration-200"
                        title="Download report"
                    >
                        <FiDownload size={18} />
                    </button>
                </div>
            </div>
            <div className="p-6 p-[10px]!">
                <div className="grid grid-cols-10 gap-5" ref={printRef}>
                    <div className="col-span-3 flex flex-col gap-5">
                        {/* GLOBAL SCORE */}
                        <div className="rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
                            <GlobalScoreGauge score={globalScore} />
                        </div>

                        <div className="flex items-end justify-end">
                            <RiskScoreCard score={latestScore}/>
                        </div>
                    </div>
                    {/* RISK TREND */}
                    <div className="col-span-7 flex flex-col min-h-[380px] rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-200 m-[10px]!">
                                Risk Trend – Last {period === 24 ? "24 hours" : "7 days"} ({entityId})
                            </h2>
                        </div>

                        {/* Chart */}
                        <div className="flex-1">
                            <TrendGraph history={history} period={period} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}