import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  DollarSign,
  TrendingUp,
  Percent,
  AlertCircle,
} from "lucide-react";
import { apiService } from "@/services/api";
import { PortfolioSummary } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
};

export default function Dashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PortfolioSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getPortfolioSummary();
      setData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load portfolio data";
      setError(message);
      toast({
        title: "Error Loading Dashboard",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    loading,
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    loading?: boolean;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your credit risk portfolio and application metrics
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Applications"
            value={data?.total_applications.toLocaleString() || "0"}
            icon={Users}
            loading={loading}
          />
          <StatCard
            title="Approval Rate"
            value={data ? `${(data.approval_rate * 100).toFixed(1)}%` : "0%"}
            icon={TrendingUp}
            loading={loading}
          />
          <StatCard
            title="Average PD"
            value={data ? `${(data.average_pd * 100).toFixed(2)}%` : "0%"}
            icon={Percent}
            loading={loading}
          />
          <StatCard
            title="Total Expected Loss"
            value={data ? `$${data.total_expected_loss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0"}
            icon={DollarSign}
            loading={loading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Risk Band Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Band Distribution</CardTitle>
              <CardDescription>Applications by risk category</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : data && data.risk_band_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.risk_band_distribution.map((item) => ({
                        name: item.risk_band,
                        value: item.count,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) =>
                        `${name}: ${(percentage || 0).toFixed(1)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.risk_band_distribution.map((entry, index) => {
                        const color =
                          COLORS[entry.risk_band.toLowerCase() as keyof typeof COLORS] ||
                          "#6b7280";
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <AlertCircle className="mx-auto mb-2 h-12 w-12 opacity-20" />
                    <p>No distribution data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expected Loss by Band */}
          <Card>
            <CardHeader>
              <CardTitle>Expected Loss by Risk Band</CardTitle>
              <CardDescription>Potential losses across risk categories</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : data && data.expected_loss_by_band.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.expected_loss_by_band}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="risk_band" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) =>
                        `$${value.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      }
                    />
                    <Bar dataKey="total_loss" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <AlertCircle className="mx-auto mb-2 h-12 w-12 opacity-20" />
                    <p>No loss data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
