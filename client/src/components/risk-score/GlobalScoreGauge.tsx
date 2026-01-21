import { PieChart, Pie, Cell } from "recharts";

type GlobalScoreGaugeProps = {
  score: number;
};

export default function GlobalScoreGauge({ score }: GlobalScoreGaugeProps) {
  const getStatusColor = (val: number) => {
    if (val > 70) return "#c62828"; 
    if (val > 30) return "#fbc02d"; 
    return "#03c74b"; 
  };

  const activeColor = getStatusColor(score);

  const data = [
    { value: 33, color: "#ef4444" }, 
    { value: 34, color: "#facc15" }, 
    { value: 33, color: "#22c55e" }, 
  ];

  const width = 240;
  const height = 160;
  const cx = width / 2;
  const cy = height - 20; 
  const innerRadius = 60;
  const outerRadius = 85;

  const needle = (value: number, color: string) => {
    const RADIAN = Math.PI / 180;
    // Mapiramo 0-100 na 180-0 stepeni
    const ang = 180.0 * (1 - value / 100);
    const length = (innerRadius + 2 * outerRadius) / 3;
    
    const r = 5; // Fiksni radijus baze igle

    // TRIK ZA FIKSNU ŠIRINU: 
    // Računamo tačke baze normalno na pravac igle (ang +/- 90 stepeni)
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
      <h2 className="text-sm uppercase tracking-widest text-gray-400">
                Global Security Posture
      </h2>

      <div style={{ width: width, height: height }}>
        <PieChart width={width} height={height}>
          <Pie
            dataKey="value"
            startAngle={0}
            endAngle={180}
            data={data}
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} opacity={0.4} />
            ))}
          </Pie>
          {needle(score, activeColor)}
        </PieChart>
      </div>

      <div className={`mt-4 text-6xl font-bold`} style={{ color: activeColor }}>
          {score}
      </div>
      <div className="text-center mt-2">
        <p className="font-bold text-lg uppercase tracking-widest" style={{ color: activeColor }}>
          {score > 70 ? "Critical" : score > 30 ? "Warning" : "Good"}
        </p>
      </div>
    </div>
  );
}