import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", expectedLoss: 2400, actualLoss: 2100 },
  { month: "Feb", expectedLoss: 2210, actualLoss: 2400 },
  { month: "Mar", expectedLoss: 2290, actualLoss: 2000 },
  { month: "Apr", expectedLoss: 2000, actualLoss: 1800 },
  { month: "May", expectedLoss: 2181, actualLoss: 2100 },
  { month: "Jun", expectedLoss: 2500, actualLoss: 2300 },
  { month: "Jul", expectedLoss: 2100, actualLoss: 1900 },
  { month: "Aug", expectedLoss: 2300, actualLoss: 2200 },
  { month: "Sep", expectedLoss: 2400, actualLoss: 2100 },
  { month: "Oct", expectedLoss: 2200, actualLoss: 2000 },
  { month: "Nov", expectedLoss: 2100, actualLoss: 1800 },
  { month: "Dec", expectedLoss: 2000, actualLoss: 1700 },
];

export function PortfolioChart() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Expected vs Actual Loss</h3>
        <p className="text-sm text-muted-foreground">Monthly portfolio performance</p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="expectedLoss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="actualLoss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value / 1000}k`}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
            />
            <Area
              type="monotone"
              dataKey="expectedLoss"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#expectedLoss)"
              name="Expected Loss"
            />
            <Area
              type="monotone"
              dataKey="actualLoss"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#actualLoss)"
              name="Actual Loss"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Expected Loss</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Actual Loss</span>
        </div>
      </div>
    </div>
  );
}
