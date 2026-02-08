import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { AnomalyResultDTO } from "../../types/ueba/AnomalyResultDTO";

type ChartDataPoint = {
  timestamp: number;
  count: number;
};

type AnomaliesGraphProps = {
  anomalies: AnomalyResultDTO[];
  filterValue: string;
};

export default function AnomaliesGraph({
  anomalies,
  filterValue,
}: AnomaliesGraphProps) {
  const generateChartData = (): { data: ChartDataPoint[]; avg: number } => {
    let filteredAnomalies = anomalies;

    // Parse filter value (only filter if it's not all/*)
    if (filterValue && filterValue !== "*") {
      const [type, value] = filterValue.split(":");
      
      if (type === "user") {
        filteredAnomalies = anomalies.filter((a) => a.userId === parseInt(value));
      } else if (type === "role") {
        filteredAnomalies = anomalies.filter((a) => a.userRole === value);
      }
    }

    console.log("Filtered anomalies:", filteredAnomalies);

    if (filteredAnomalies.length === 0) {
      return { data: [], avg: 0 };
    }

    // Get average alerts per day (use first anomaly's avg)
    const avgAlertsPerDay = filteredAnomalies[0]?.avgAlertsPerDay || 0;

    // Collect all timestamps
    const allTimestamps: Date[] = [];
    filteredAnomalies.forEach((anomaly) => {
      const timestamps = anomaly.alertTimestamps || [];
      allTimestamps.push(...timestamps.map(t => new Date(t)));
    });

    console.log("All timestamps:", allTimestamps);

    if (allTimestamps.length === 0) {
      return { data: [], avg: avgAlertsPerDay };
    }

    // Sort timestamps
    allTimestamps.sort((a, b) => a.getTime() - b.getTime());

    // Create data points - count alerts per hour
    const hourMap: { [key: number]: number } = {};
    allTimestamps.forEach((timestamp) => {
      const hourKey = Math.floor(timestamp.getTime() / (1000 * 60 * 60)); // Hour-based grouping
      hourMap[hourKey] = (hourMap[hourKey] || 0) + 1;
    });

    const chartData = Object.entries(hourMap).map(([hour, count]) => ({
      timestamp: parseInt(hour) * 1000 * 60 * 60,
      count,
    }));

    console.log("Chart data:", chartData, "Avg:", avgAlertsPerDay);

    return { data: chartData, avg: avgAlertsPerDay };
  };

  const { data: chartData, avg } = generateChartData();

  return (
    <div className="bg-[#1f1f1f] border border-[#282A28] rounded-lg p-4! mb-4!">
      {chartData.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          No data available for the selected filter
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ bottom: 20, right: 30, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.5} />

            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) => {
                const date = new Date(timestamp);
                return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:00`;
              }}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#ffffff", fontSize: 11, fontWeight: "bold" }}
              tickMargin={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#ffffff", fontSize: 12, fontWeight: "bold" }}
              tickMargin={10}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#1f1f1f",
                border: "1px solid #333",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
              labelFormatter={(timestamp: number) => {
                const date = new Date(timestamp);
                return `${date.toLocaleDateString()} ${date.getHours()}:00`;
              }}
              formatter={(value: any, name: string | undefined) => {
                if (name === "count") return [value, "Alerts"];
                return [value, name];
              }}
            />

            {/* Average Alerts Per Day - Horizontal Reference Line */}
            <ReferenceLine 
              y={avg} 
              stroke="#60cdff" 
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ 
                value: `Avg: ${avg.toFixed(2)}`, 
                position: 'right',
                fill: '#60cdff',
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />

            {/* Alert Timestamps - Connected Points */}
            <Line
              type="monotone"
              dataKey="count"
              stroke="#007a55"
              strokeWidth={2}
              dot={{ fill: "#007a55", r: 5 }}
              activeDot={{ r: 7 }}
              name="count"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
