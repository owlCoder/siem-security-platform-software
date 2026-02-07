import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SecurityMaturityTrendDTO } from "../../models/security-maturity/SecurityMaturityTrendDTO";
import { TrendMetricType } from "../../enums/TrendMetricType";
import { useState } from "react";

type TrendPeriod = "24h" | "7d";

interface Props {
  data: Partial<Record<TrendMetricType, SecurityMaturityTrendDTO[]>>;
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
}

type ChartRow = {
    bucketStart: string;
} & Partial<Record<TrendMetricType, number>>;

const METRIC_COLORS: Record<TrendMetricType, string> = {
    MTTD: "#007a55",
    MTTR: "#4A9DAE",
    SMS: "#facc15",
    FALSE_ALARM_RATE: "#ef4444",
};



export default function SecurityMaturityTrend({data, period, onPeriodChange}: Props){

    const [visibleMetrics, setVisibleMetrics] = useState<TrendMetricType[]>([TrendMetricType.MTTD,]);

    const firstMetric = data[visibleMetrics[0]];

    const combinedData: ChartRow[] = firstMetric?.map((point, index) => {
        const row: ChartRow = {
            bucketStart: point.bucketStart
        };

        (Object.keys(data) as TrendMetricType[]).forEach((metric) => {
            row[metric] = data[metric]?.[index]?.value;
        });

        return row;
    }) ?? [];

    return (
        <div className="flex flex-col justify-center w-full min-h-[220px]" style={{marginTop: "30px", marginBottom: "30px"}}>
                <h3 className="text-center text-sm uppercase tracking-widest text-gray-400 mb-5!">
                    Security Maturity Score
                </h3>

            <div className="flex justify-center gap-2 mb-4">
                {(["24h", "7d"] as const).map((p) => (
                    <button
                    key={p}
                    onClick={() => onPeriodChange(p)}
                    className={`px-3 py-1 rounded-[8px] text-xs font-semibold transition-all
                        ${
                        period === p
                            ? "bg-[#007a55] text-white"
                            : "bg-[#313338] text-gray-300 hover:bg-[#3a3d40]"
                        }`}
                    >
                    {p}
                    </button>
                ))}
            </div>
            
            <div className="h-[350px] p-4!">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={combinedData}>
                        <XAxis
                        dataKey="bucketStart"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#fff", fontSize: 12, fontWeight: "bold" }}
                        />
                        <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#fff", fontSize: 12, fontWeight: "bold" }}
                        />
                        <Tooltip
                        contentStyle={{
                            backgroundColor: "#1f2123",
                            border: "1px solid #292a28",
                            borderRadius: "8px",
                        }}
                        />

                        {visibleMetrics.map((metric) => (
                        <Area
                            key={metric}
                            type="monotone"
                            dataKey={metric}
                            stroke={METRIC_COLORS[metric]}
                            fill={METRIC_COLORS[metric]}
                            fillOpacity={0.15}
                            strokeWidth={4}
                            dot={false}
                        />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex flex-col items-center m-4!">
                <div className="flex gap-2">
                {(Object.values(TrendMetricType) as TrendMetricType[]).map(
                    (metric) => (
                    <button
                        key={metric}
                        onClick={() =>
                        setVisibleMetrics((prev) =>
                            prev.includes(metric)
                            ? prev.filter((m) => m !== metric)
                            : [...prev, metric]
                        )
                        }
                        className={`px-4! py-2! rounded-[10px]! text-xs font-semibold transition-all ${
                        visibleMetrics.includes(metric)
                            ? "bg-[#007a55]"
                            : "bg-[#313338]"
                        }`}
                    >
                        {metric}
                    </button>
                    )
                )}
                </div>
            </div>
    </div>
    );
}