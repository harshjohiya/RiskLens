import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api.ts";
import {
  FileText,
  TrendingUp,
  DollarSign,
  Users,
} from "lucide-react";
import { MetricCard, MetricCardSkeleton } from "@/components/common/MetricCard";
import { EmptyState, ErrorState } from "@/components/common/States";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { ExpectedLossChart } from "@/components/dashboard/ExpectedLossChart";

export default function DashboardPage() {
  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["portfolio-summary"],
    queryFn: () => api.getPortfolioSummary(),
    retry: 2,
  });

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Portfolio risk overview and analytics
          </p>
        </div>
        <ErrorState
          message={error instanceof Error ? error.message : "Failed to load portfolio data"}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Check for empty data
  const isEmpty = summary && summary.total_applications === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Portfolio risk overview and analytics
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : isEmpty ? (
          <>
            <MetricCard
              title="Total Applications"
              value="0"
              subtitle="No data yet"
              icon={<FileText className="w-5 h-5" />}
            />
            <MetricCard
              title="Approval Rate"
              value="—"
              subtitle="No data yet"
              icon={<Users className="w-5 h-5" />}
            />
            <MetricCard
              title="Average PD"
              value="—"
              subtitle="No data yet"
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <MetricCard
              title="Total Expected Loss"
              value="—"
              subtitle="No data yet"
              icon={<DollarSign className="w-5 h-5" />}
            />
          </>
        ) : (
          <>
            <MetricCard
              title="Total Applications"
              value={summary!.total_applications.toLocaleString()}
              subtitle="All time"
              icon={<FileText className="w-5 h-5" />}
            />
            <MetricCard
              title="Approval Rate"
              value={`${(summary!.approval_rate * 100).toFixed(1)}%`}
              subtitle="Of total applications"
              icon={<Users className="w-5 h-5" />}
            />
            <MetricCard
              title="Average PD"
              value={`${(summary!.average_pd * 100).toFixed(2)}%`}
              subtitle="Portfolio average"
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <MetricCard
              title="Total Expected Loss"
              value={`$${summary!.total_expected_loss.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`}
              subtitle="Aggregate EL"
              icon={<DollarSign className="w-5 h-5" />}
            />
          </>
        )}
      </div>

      {/* Charts */}
      {isEmpty ? (
        <EmptyState
          title="No applications scored yet"
          description="Start by scoring individual applications or uploading a batch file to see your portfolio analytics here."
          action={{
            label: "Score an Application",
            onClick: () => (window.location.href = "/app/scoring"),
          }}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Risk Band Distribution
            </h3>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">
                  Loading chart...
                </div>
              </div>
            ) : (
              <RiskDistributionChart
                data={summary!.risk_band_distribution}
              />
            )}
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Expected Loss by Band
            </h3>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">
                  Loading chart...
                </div>
              </div>
            ) : (
              <ExpectedLossChart data={summary!.expected_loss_by_band} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
