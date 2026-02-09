import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { RiskBand, Decision, HistoryFilters } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBandBadge, DecisionBadge } from "@/components/common/Badges";
import { EmptyState, ErrorState } from "@/components/common/States";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

export default function HistoryPage() {
  const [filters, setFilters] = useState<HistoryFilters>({
    page: 1,
    page_size: 10,
    risk_band: "",
    decision: "",
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["history", filters],
    queryFn: () => api.getHistory(filters),
    retry: 2,
  });

  const handleFilterChange = (
    key: keyof HistoryFilters,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">History</h1>
          <p className="text-muted-foreground">
            Audit log of all scored applications
          </p>
        </div>
        <ErrorState
          message={error instanceof Error ? error.message : "Failed to load history"}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">History</h1>
        <p className="text-muted-foreground">
          Audit log of all scored applications
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card border border-border rounded-lg">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Risk Band:</span>
          <Select
            value={filters.risk_band || "all"}
            onValueChange={(value) =>
              handleFilterChange("risk_band", value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="A">Band A</SelectItem>
              <SelectItem value="B">Band B</SelectItem>
              <SelectItem value="C">Band C</SelectItem>
              <SelectItem value="D">Band D</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Decision:</span>
          <Select
            value={filters.decision || "all"}
            onValueChange={(value) =>
              handleFilterChange("decision", value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Approve">Approve</SelectItem>
              <SelectItem value="Reject">Reject</SelectItem>
              <SelectItem value="Manual Review">Manual Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application ID</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Risk Band</TableHead>
              <TableHead>Decision</TableHead>
              <TableHead className="text-right">PD</TableHead>
              <TableHead className="text-right">Risk Score</TableHead>
              <TableHead className="text-right">Expected Loss</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-12 ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-10 ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    title="No records found"
                    description="No applications match your current filters. Try adjusting your search criteria."
                  />
                </TableCell>
              </TableRow>
            ) : (
              data?.records.map((record) => (
                <TableRow key={record.application_id} className="data-row">
                  <TableCell className="font-mono text-sm">
                    {record.application_id}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(record.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <RiskBandBadge band={record.risk_band} />
                  </TableCell>
                  <TableCell>
                    <DecisionBadge decision={record.decision} />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {(record.pd * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {record.risk_score}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${record.expected_loss.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(data.page - 1) * data.page_size + 1} to{" "}
              {Math.min(data.page * data.page_size, data.total)} of {data.total}{" "}
              results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(data.page - 1)}
                disabled={data.page <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {data.page} of {data.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(data.page + 1)}
                disabled={data.page >= data.total_pages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
