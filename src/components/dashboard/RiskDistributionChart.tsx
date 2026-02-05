import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { RiskBandDistribution } from "@/types/api";

interface RiskDistributionChartProps {
  data: RiskBandDistribution[];
}

const COLORS = {
  A: "hsl(142, 76%, 36%)",
  B: "hsl(47, 96%, 53%)",
  C: "hsl(25, 95%, 53%)",
  D: "hsl(0, 72%, 51%)",
};

export function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: `Band ${item.band}`,
    value: item.count,
    percentage: item.percentage,
    band: item.band,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percentage }) =>
              `${name}: ${(percentage * 100).toFixed(1)}%`
            }
            labelLine={false}
          >
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.band}`}
                fill={COLORS[entry.band as keyof typeof COLORS]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value.toLocaleString()} applications`,
              name,
            ]}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
