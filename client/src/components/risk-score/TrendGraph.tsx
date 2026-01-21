import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts";

type Props = {
  history: { score: number; createdAt: Date }[];
  period: number;
};

export default function TrendGraph({ history, period }: Props) {
  const now = new Date();

  const generateChartData = (): { score: number; createdAt: Date }[] => {
    const data: { score: number; createdAt: Date }[] = [];

    if (period > 24) {
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);
        day.setHours(0, 0, 0, 0);

        const item = history.find((h) => {
          const d = new Date(h.createdAt);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === day.getTime();
        });

        data.push({ createdAt: day, score: item ? item.score : 0 });
      }
    } else {
      for (let i = 24; i >= 0; i--) {
        const hour = new Date(now);
        hour.setHours(now.getHours() - i);
        hour.setMinutes(0, 0, 0);

        const item = history.find((h) => {
          const d = new Date(h.createdAt);
          return (
            d.getFullYear() === hour.getFullYear() &&
            d.getMonth() === hour.getMonth() &&
            d.getDate() === hour.getDate() &&
            d.getHours() === hour.getHours()
          );
        });

        data.push({ createdAt: hour, score: item ? item.score : 0 });
      }
    }
    return data;
  };

  const chartData = generateChartData();

  const formatXAxis = (value: Date) => {
    const date = new Date(value);
    if (period > 24) return `${date.getDate()}/${date.getMonth() + 1}`;
    return `${date.getHours()}:00`;
  };

  return (
    <ResponsiveContainer width="100%" height={500}>
      <AreaChart data={chartData} margin={{ bottom: 20, right: 30, top: 10 }}>
        <defs>
          <linearGradient id="scoreGradColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#007a55" stopOpacity={0.4} />
            <stop offset="75%" stopColor="#007a55" stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.5} />

        <XAxis
          dataKey="createdAt"
          tickFormatter={formatXAxis}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#ffffff", fontSize: 13, fontWeight: "bold" }}
          tickMargin={10}
          interval={period <= 24 ? 4 : 0}
        />

        <YAxis
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#ffffff", fontSize: 13, fontWeight: "bold" }}
          tickMargin={10}
        />

        <Tooltip
          contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333", borderRadius: "8px" }}
          labelStyle={{ color: "#fff" }}
          labelFormatter={(label: Date) => {
            const date = new Date(label);
            if (period > 24) return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            return `${date.getHours()}:00`;
          }}
        />

        <Area
          type="monotone"
          dataKey="score"
          stroke="#007a55"
          fill="url(#scoreGradColor)"
          strokeWidth={5} 
          dot={false}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}