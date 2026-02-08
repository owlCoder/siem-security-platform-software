import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SecuirtyMaturityIncidentsByCategoryDTO } from "../../models/security-maturity/SecurityMaturityIncidentsByCategory"

type Props = {
    data: SecuirtyMaturityIncidentsByCategoryDTO[];
};

export default function IncidentsByCategoryChart({data}: Props){

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1e1f22] border border-[#313338] rounded-[10px] p-3! text-white">
                    <p className="m-0! text-sm font-semibold">
                        {payload[0].payload.label}
                    </p>
                    <p className="mt-1! text-sm text-[#4A9DAE]">
                        {payload[0].value} incidents
                    </p>
                </div>
            );
        }
        return null;
    };

    const formatCategory = (category: string) => {
        return category.replace(/_/g, " ");
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full" style={{marginTop: "30px", marginBottom: "10px"}}>
            <h3 className="text-sm uppercase tracking-widest text-gray-400">
                Incidents By Category
            </h3>
            <div className="w-full h-full mt-5! mr-5!">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        data={data}
                        margin={{top: 10, right: 20, left: 0, bottom: 40}} >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#333"
                            opacity={0.5} />

                        <XAxis
                            dataKey="category"
                            tickFormatter={formatCategory}
                            tick={{fill: "#fff", fontSize: 13, fontWeight: "bold"}}
                            axisLine={false}
                            tickLine={false}
                            textAnchor="end"
                            height={60} />
                        <YAxis
                            tick={{fill: "#fff", fontSize: 13, fontWeight: "bold"}}
                            axisLine={false}
                            tickLine={false} 
                            domain={[0, (dataMax: number) => (dataMax * 1.20)]}/>
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34, 210, 99, 0.1)' }} />

                        <Bar
                            dataKey="count"
                            fill="#007a55"
                            fillOpacity={0.35}
                            activeBar={{
                                fill: "#007a55",
                                fillOpacity: 1
                            }}
                            radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}