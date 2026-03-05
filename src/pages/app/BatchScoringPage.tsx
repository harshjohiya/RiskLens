import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BatchJobStatus, BatchResultRow, BatchScoreResponse, SchemaAlignmentInfo } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a flat CSV text into an array of objects keyed by header name.
 *  Handles commas inside the last field (reason_codes). */
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rcIdx = headers.indexOf("reason_codes");

  return lines.slice(1).map((line) => {
    // Split by comma but keep everything from reason_codes onwards joined
    const parts = line.split(",");
    const values =
      rcIdx >= 0 && parts.length > headers.length
        ? [...parts.slice(0, rcIdx), parts.slice(rcIdx).join(",")]
        : parts;

    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (values[i] ?? "").trim().replace(/^"|"$/g, "");
    });
    return obj;
  });
}

/** Convert a string to a number; return `fallback` (default 0) when NaN. */
function safeNum(v: string | undefined, fallback = 0): number {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
}

/** Format a number for display; return "-" when NaN/undefined. */
function fmt(v: number | undefined, decimals?: number): string {
  if (v === undefined || isNaN(v)) return "-";
  return decimals !== undefined ? v.toFixed(decimals) : v.toLocaleString();
}

// ---------------------------------------------------------------------------

export default function BatchScoringPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [results, setResults] = useState<BatchResultRow[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [alignmentInfo, setAlignmentInfo] = useState<SchemaAlignmentInfo | null>(null);

  // Submit batch job
  const submitMutation = useMutation({
    mutationFn: () => api.submitBatchScore(file!, "lightgbm"),
    onSuccess: (data: BatchScoreResponse) => {
      setJobId(data.job_id);
      if (data.schema_alignment) setAlignmentInfo(data.schema_alignment);
      toast({
        title: "Batch Job Submitted",
        description: `Job ID: ${data.job_id}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description:
          error instanceof Error ? error.message : "Failed to submit batch job",
        variant: "destructive",
      });
    },
  });

  // Poll job status
  const { data: jobStatus, isLoading: isPolling } = useQuery({
    queryKey: ["batch-job", jobId],
    queryFn: () => api.getBatchJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data as BatchJobStatus | undefined;
      if (data?.status === "completed" || data?.status === "failed") {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "text/csv" || droppedFile?.name.endsWith(".csv")) {
      setFile(droppedFile);
      setJobId(null);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setJobId(null);
    }
  };

  const handleSubmit = () => {
    if (file) {
      submitMutation.mutate();
    }
  };

  const handleViewResults = async () => {
    if (!jobId) return;

    try {
      const csvText = await api.downloadBatchResults(jobId);
      const rows = parseCsv(csvText);

      if (rows.length === 0) {
        toast({ title: "Empty Results", description: "The result file has no data rows.", variant: "destructive" });
        return;
      }

      // The output CSV has the original uploaded columns first, then prediction
      // columns appended by the backend.  We look up every field by header name
      // so column order never matters.
      const parsedResults: BatchResultRow[] = rows.map((r) => ({
        // The backend always emits canonical column names from the aligned df.
        age_years: safeNum(r["age_years"]),
        income_total: safeNum(r["AMT_INCOME_TOTAL"]),
        credit_amount: safeNum(r["AMT_CREDIT"]),
        annuity: safeNum(r["AMT_ANNUITY"]),
        family_members: safeNum(r["CNT_FAM_MEMBERS"]),
        num_active_loans: safeNum(r["num_active_loans"]),
        num_closed_loans: safeNum(r["num_closed_loans"]),
        num_bureau_loans: safeNum(r["num_bureau_loans"]),
        max_delinquency: safeNum(r["max_delinquency"]),
        total_delinquency_months: safeNum(r["total_delinquency_months"]),
        pd: safeNum(r["pd"]),
        risk_score: safeNum(r["risk_score"]),
        risk_band: (r["risk_band"] || "D") as BatchResultRow["risk_band"],
        expected_loss: safeNum(r["expected_loss"]),
        decision: (r["decision"] || "Error") as BatchResultRow["decision"],
        reason_codes: r["reason_codes"] ?? "",
        error: r["error"],
      }));

      setResults(parsedResults);
      setShowResults(true);
    } catch (error) {
      toast({
        title: "Failed to Load Results",
        description: error instanceof Error ? error.message : "Could not load batch results",
        variant: "destructive",
      });
    }
  };

  const getProgressValue = () => {
    if (!jobStatus) return 0;
    if (jobStatus.status === "pending") return 10;
    if (jobStatus.status === "processing") {
      if (jobStatus.total_records) {
        const processed = (jobStatus.successful_records || 0) + (jobStatus.failed_records || 0);
        return Math.round((processed / jobStatus.total_records) * 100);
      }
      return 50;
    }
    if (jobStatus.status === "completed") return 100;
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Batch Scoring</h1>
        <p className="text-muted-foreground">
          Process multiple applications from a CSV file
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50",
              file && "border-status-success bg-status-success/5"
            )}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              {file ? (
                <>
                  <FileText className="w-12 h-12 text-status-success mb-4" />
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-xs text-primary mt-2">
                    Click to change file
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="font-medium text-foreground">
                    Drop your CSV file here
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse
                  </p>
                </>
              )}
            </label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!file || submitMutation.isPending}
            className="w-full"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit Batch Job
              </>
            )}
          </Button>
        </div>

        {/* Status Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Job Status
          </h2>

          {!jobId && !isPolling && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Upload a CSV file and submit to start a batch job.
              </p>
            </div>
          )}

          {jobId && jobStatus && (
            <div className="space-y-6 animate-fade-in">
              {/* Job ID */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Job ID
                </p>
                <p className="font-mono text-sm text-foreground">{jobId}</p>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Status
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                      jobStatus.status === "pending" &&
                        "bg-status-warning/10 text-status-warning",
                      jobStatus.status === "processing" &&
                        "bg-status-info/10 text-status-info",
                      jobStatus.status === "completed" &&
                        "bg-status-success/10 text-status-success",
                      jobStatus.status === "failed" &&
                        "bg-status-error/10 text-status-error"
                    )}
                  >
                    {jobStatus.status === "pending" && (
                      <Clock className="w-3 h-3" />
                    )}
                    {jobStatus.status === "processing" && (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    )}
                    {jobStatus.status === "completed" && (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    {jobStatus.status === "failed" && (
                      <XCircle className="w-3 h-3" />
                    )}
                    {jobStatus.status.charAt(0).toUpperCase() +
                      jobStatus.status.slice(1)}
                  </span>
                </div>

                <Progress value={getProgressValue()} className="h-2" />

                {jobStatus.total_records && (
                  <p className="text-sm text-muted-foreground">
                    {(jobStatus.successful_records || 0) + (jobStatus.failed_records || 0)} of{" "}
                    {jobStatus.total_records} records processed
                  </p>
                )}
              </div>

              {/* Error Message */}
              {jobStatus.status === "failed" && jobStatus.error_message && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">
                    {jobStatus.error_message}
                  </p>
                </div>
              )}

              {/* Download Button */}
              {jobStatus.status === "completed" && (
                <div className="space-y-2">
                  <Button 
                    onClick={handleViewResults}
                    className="w-full"
                    variant="default"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Results ({jobStatus.total_records} rows)
                  </Button>
                  <Button
                    onClick={async () => {
                      const csvText = await api.downloadBatchResults(jobId!);
                      const blob = new Blob([csvText], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `batch_results_${jobId}.csv`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-foreground">
                    {new Date(jobStatus.created_at).toLocaleString()}
                  </span>
                </div>
                {jobStatus.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="text-foreground">
                      {new Date(jobStatus.completed_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Table */}
      {showResults && results.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">
              Batch Results ({results.length} records)
            </h2>
            <Button
              onClick={() => setShowResults(false)}
              variant="ghost"
              size="sm"
            >
              Hide Results
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-right">Age</th>
                  <th className="p-2 text-right">Income</th>
                  <th className="p-2 text-right">Credit Amt</th>
                  <th className="p-2 text-right">PD</th>
                  <th className="p-2 text-right">Risk Score</th>
                  <th className="p-2 text-center">Band</th>
                  <th className="p-2 text-right">Exp. Loss</th>
                  <th className="p-2 text-center">Decision</th>
                  <th className="p-2 text-left">Reason Codes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((row, idx) => (
                  <tr key={idx} className={cn("hover:bg-muted/50", row.error && "opacity-60")}>
                    <td className="p-2 text-muted-foreground">{idx + 1}</td>
                    <td className="p-2 text-right">{fmt(row.age_years)}</td>
                    <td className="p-2 text-right">{isNaN(row.income_total) ? "-" : `$${row.income_total.toLocaleString()}`}</td>
                    <td className="p-2 text-right">{isNaN(row.credit_amount) ? "-" : `$${row.credit_amount.toLocaleString()}`}</td>
                    <td className="p-2 text-right">{isNaN(row.pd) ? "-" : `${(row.pd * 100).toFixed(2)}%`}</td>
                    <td className="p-2 text-right font-medium">{fmt(row.risk_score)}</td>
                    <td className="p-2 text-center">
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 rounded text-xs font-semibold",
                          row.risk_band === "A" && "bg-status-success/20 text-status-success",
                          row.risk_band === "B" && "bg-status-info/20 text-status-info",
                          row.risk_band === "C" && "bg-status-warning/20 text-status-warning",
                          row.risk_band === "D" && "bg-status-error/20 text-status-error"
                        )}
                      >
                        {row.risk_band}
                      </span>
                    </td>
                    <td className="p-2 text-right">{isNaN(row.expected_loss) ? "-" : `$${row.expected_loss.toLocaleString()}`}</td>
                    <td className="p-2 text-center">
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 rounded text-xs font-semibold",
                          row.decision === "Approve" && "bg-status-success/20 text-status-success",
                          row.decision === "Reject" && "bg-status-error/20 text-status-error",
                          row.decision === "Manual Review" && "bg-status-warning/20 text-status-warning"
                        )}
                      >
                        {row.decision}
                      </span>
                    </td>
                    <td className="p-2 text-xs text-muted-foreground max-w-xs truncate">
                      {row.reason_codes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Statistics */}
          {(() => {
            const scored = results.filter((r) => !r.error && !isNaN(r.pd));
            const n = scored.length || 1;
            const approvalRate = (scored.filter((r) => r.decision === "Approve").length / n) * 100;
            const avgPd = (scored.reduce((s, r) => s + r.pd, 0) / n) * 100;
            const avgScore = scored.reduce((s, r) => s + r.risk_score, 0) / n;
            const totalEL = scored.reduce((s, r) => s + r.expected_loss, 0);
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Approval Rate</p>
                  <p className="text-lg font-semibold text-foreground">{approvalRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg PD</p>
                  <p className="text-lg font-semibold text-foreground">{avgPd.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Risk Score</p>
                  <p className="text-lg font-semibold text-foreground">{Math.round(avgScore)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Exp. Loss</p>
                  <p className="text-lg font-semibold text-foreground">${totalEL.toLocaleString()}</p>
                </div>
              </div>
            );
          })()}

          {/* Schema Alignment Info */}
          {alignmentInfo && Object.keys(alignmentInfo.column_mapping).length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Column Mapping Applied ({alignmentInfo.matched_columns}/{alignmentInfo.total_training_columns} matched)
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(alignmentInfo.column_mapping).map(([from, to]) => (
                  <span key={from} className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                    <span className="font-mono">{from}</span>
                    <span className="opacity-50">→</span>
                    <span className="font-mono text-foreground">{to}</span>
                  </span>
                ))}
              </div>
              {alignmentInfo.missing_columns.length > 0 && (
                <p className="mt-2 text-xs text-status-warning">
                  Missing columns (filled with NaN for imputer): {alignmentInfo.missing_columns.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
