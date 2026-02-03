import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { apiService } from "@/services/api";
import { HistoryRecord, HistoryFilters } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function History() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<HistoryFilters>({
    page: 1,
    page_size: 20,
  });

  useEffect(() => {
    loadHistory();
  }, [page]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getHistory({
        ...filters,
        page,
        page_size: pageSize,
      });
      setRecords(response.records);
      setTotal(response.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load history";
      setError(message);
      toast({
        title: "Error Loading History",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof HistoryFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleApplyFilters = () => {
    setPage(1);
    loadHistory();
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      page_size: pageSize,
    });
    setPage(1);
    loadHistory();
  };

  const handleRowClick = (applicationId: string) => {
    navigate(`/explainability?id=${applicationId}`);
  };

  const getRiskBandColor = (band: string) => {
    const lower = band.toLowerCase();
    if (lower.includes("low")) return "bg-green-500";
    if (lower.includes("medium")) return "bg-yellow-500";
    if (lower.includes("high")) return "bg-red-500";
    return "bg-gray-500";
  };

  const getDecisionVariant = (decision: string) => {
    const lower = decision.toLowerCase();
    if (lower.includes("approve")) return "default";
    if (lower.includes("reject") || lower.includes("decline")) return "destructive";
    return "secondary";
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <AppLayout>
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Application History</h1>
            <p className="text-muted-foreground">
              View and filter past credit risk assessments
            </p>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Search and filter application records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={filters.start_date || ""}
                    onChange={(e) => handleFilterChange("start_date", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={filters.end_date || ""}
                    onChange={(e) => handleFilterChange("end_date", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk_band">Risk Band</Label>
                  <Select
                    value={filters.risk_band || "all"}
                    onValueChange={(value) =>
                      handleFilterChange("risk_band", value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger id="risk_band">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decision">Decision</Label>
                  <Select
                    value={filters.decision || "all"}
                    onValueChange={(value) =>
                      handleFilterChange("decision", value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger id="decision">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Review">Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button onClick={handleApplyFilters}>
                  <Search className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
                <Button onClick={handleResetFilters} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Records</CardTitle>
              <CardDescription>
                {loading ? "Loading..." : `Showing ${records.length} of ${total} records`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Risk Band</TableHead>
                      <TableHead>Decision</TableHead>
                      <TableHead>PD</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Expected Loss</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={7}>
                            <Skeleton className="h-8 w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : records.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <AlertCircle className="mb-2 h-12 w-12 opacity-20" />
                            <p>No records found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      records.map((record) => (
                        <TableRow
                          key={record.application_id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(record.application_id)}
                        >
                          <TableCell className="font-mono text-sm">
                            {record.application_id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {format(new Date(record.timestamp), "MMM dd, yyyy HH:mm")}
                          </TableCell>
                          <TableCell>
                            <Badge className={getRiskBandColor(record.risk_band)}>
                              {record.risk_band}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getDecisionVariant(record.decision)}>
                              {record.decision}
                            </Badge>
                          </TableCell>
                          <TableCell>{(record.pd * 100).toFixed(2)}%</TableCell>
                          <TableCell>{record.risk_score.toFixed(0)}</TableCell>
                          <TableCell>${record.expected_loss.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {!loading && records.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
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
