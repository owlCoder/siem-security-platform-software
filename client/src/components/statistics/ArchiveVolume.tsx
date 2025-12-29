import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArchiveVolumeProps } from "../../types/props/statistics/ArchiveVolumeProps";


export default function ArchiveVolume({ data, period, onPeriodChange }: ArchiveVolumeProps){
    
    
    const CustomTooltip = ({active, payload}: any) => {
        if(active && payload && payload.length) {
            return (
                <div className="bg-[#1e1f22] border border-[#313338] rounded-[10px] p-3! text-white">
                    <p className="m-0! text-sm font-semibold">
                        {payload[0].payload.label}
                    </p>
                    <p className="mt-1! text-sm text-[#4A9DAE]">
                        {payload[0].value} MB
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col gap-4 w-full p-4!">
                <div className="flex justify-between items-center">
                    <span className="text-white text-lg font-semibold">
                        Daily Archive Volume (in MB)
                    </span>

                    <div className="flex gap-2">
                        <button
                            className={`px-5! py-2! rounded-[10px]! text-white text-sm font-semibold transition-all duration-200 ${
                            period === "daily" ? "bg-[#007a55]" : "bg-[#313338]"
                        }`}
                            onClick={() => onPeriodChange("daily")}>
                                Daily
                        </button>
                        <button
                            className={`px-5! py-2! rounded-[10px]! text-white text-sm font-semibold transition-all duration-200 ${
                            period === "monthly" ? "bg-[#007a55]" : "bg-[#313338]"
                        }`}
                            onClick={() => onPeriodChange("monthly")}>
                                Monthly
                        </button>
                        <button
                            className={`px-5! py-2! rounded-[10px]! text-white text-sm font-semibold transition-all duration-200 ${
                            period === "yearly" ? "bg-[#007a55]" : "bg-[#313338]"
                        }`}
                            onClick={() => onPeriodChange("yearly")}>
                                Yearly
                        </button>
                    </div>
            </div>

            {data.length > 0 ? (
                <div className="w-full h-[350px] rounded-[10px] p-5!">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0}}>

                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: "#ffffff", fontSize: 13, fontWeight: "bold"}} tickMargin={10} />
                            <YAxis tick={{fill: "#ffffff", fontSize: 13, fontWeight: "bold"}} axisLine={false} tickLine={false} tickCount={5} tickMargin={10} />
                            
                            <Tooltip content={<CustomTooltip/>} cursor={{fill: 'rgba(34, 210, 99, 0.1)'}}/>
                            <Bar
                                dataKey="size"
                                fill="#007a55"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={80}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="text-center p-8 text-[#c5c5c5] text-sm">
                    No archive volume data available
                </div>
            )}
        </div>
    );
}