import { Cell, Pie, PieChart } from "recharts";
import { MaturityLevel } from "../../enums/MaturityLevel";

type Props = {
    score: number;
    level: MaturityLevel;
}

export default function MaturityScoreGauge({score, level}: Props){
    const getColor = (val: number) => {
        if(val >= 70) return "#22c55e";
        if(val >= 40) return "#facc15"
        return "#ef4444";
    };

    const activeColor = getColor(score);

    const data = [
        {value: 33, color: "#22c55e"},
        {value: 34, color: "#facc15"},
        {value: 33, color: "#ef4444"}
    ];

    const width = 240;
    const height = 160;
    const cx = width / 2;
    const cy = height - 20; 
    const innerRadius = 60;
    const outerRadius = 85;

    const needle = (value: number, color: string) => {
        const RADIAN = Math.PI / 180;
        const ang = 180.0 * (1 - value / 100);
        const length = (innerRadius + 2 * outerRadius) / 3;
        
        const r = 5;

        const xba = cx + r * Math.cos(RADIAN * (ang - 90));
        const yba = cy - r * Math.sin(RADIAN * (ang - 90));
        const xbb = cx + r * Math.cos(RADIAN * (ang + 90));
        const ybb = cy - r * Math.sin(RADIAN * (ang + 90));
        
        const xp = cx + length * Math.cos(RADIAN * ang);
        const yp = cy - length * Math.sin(RADIAN * ang);

        return (
            <g key="needle-group">
                <circle cx={cx+4} cy={cy} r={r} fill={color} stroke="none" />
                <path 
                d={`M${xba+4} ${yba}L${xbb+4} ${ybb}L${xp} ${yp}Z`} 
                fill={color} 
                style={{ transition: 'all 0.5s ease-out' }} 
                />
            </g>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[220px]" style={{marginTop: "30px", marginBottom: "30px"}}>
            <h3 className="text-sm uppercase tracking-widest text-gray-400">
                Security Maturity Score
            </h3>

            <div style={{ width: width, height: height }}>
              <PieChart width={width} height={height}>
                 <Pie
                     data={data}
                     dataKey="value"
                     startAngle={0}
                     endAngle={180}
                     cx={cx}
                     cy={cy}
                     innerRadius={innerRadius}
                     outerRadius={outerRadius}
                     stroke="none">
                         {data.map((d, i) => (
                             <Cell key={i} fill={d.color} opacity={0.4} />
                         ))}
                     </Pie>
                     {needle(score, activeColor)}
              </PieChart>
            </div>

            <div className={`mt-4 text-6xl font-bold`} style={{ color: activeColor }}>
                {score.toFixed(2)}
            </div>

            <div className="mt-5! text-xl uppercase tracking-widest text-gray-500 text-center">
                Maturity Level:{" "}
                <span
                    className="font-bold"
                    style={{ color: activeColor }}
                >
                    {level.replace("_", " ")}
                </span>
            </div>
        </div>

    );

}