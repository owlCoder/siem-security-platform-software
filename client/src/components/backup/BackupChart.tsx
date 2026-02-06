import { Cell, Pie, PieChart, ResponsiveContainer} from "recharts";
import { BackupChartsProps } from "../../types/props/backup/BackupChartProps";



export default function BackupChart({ data }: BackupChartsProps) {
    const chartData = [
        { name: "Successful", value: data.success, color: "#4ade80"},
        { name: "Failed", value: data.failed, color: "#f87171"}
    ];

    return(
        <div className="border border-[#2a2a2a] rounded-[10px]! p-[10px]!">
            <h3 className="text-sm mb-2 text-gray-300">Backup result distribution</h3>

            <div className="flex h-[300px] items-center gap-10 p-4!">
                <div className="h-full w-[55%]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData}
                                dataKey="value"
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                labelLine={false}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color}/>
                                    ))}
                                </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex w-[45%] flex-col gap-4">
                    {chartData.map((item, index) => (
                        <div key={index}
                            className="flex items-center justify-between bg-[#313338] rounded-[14px] px-5! py-3!">
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-md"
                                    style={{ backgroundColor: item.color}}/>
                                    <span className="text-base font-semibold text-white">
                                        {item.name}
                                    </span>
                                </div>

                                <span className="text-sm font-semibold text-[#c5c5c5]">
                                    {item.value}
                                </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}