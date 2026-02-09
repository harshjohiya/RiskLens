import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api.ts";
import type { ModelType, BatchJobStatus, BatchResultRow } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { cn } from "@/lib/utils.ts";
import { Progress } from "@/components/ui/progress";

export default function BatchScoringPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [modelType, setModelType] = useState<ModelType>("logistic");
  const [jobId, setJobId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [results, setResults] = useState<BatchResultRow[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Submit batch job
  const submitMutation = useMutation({
    mutationFn: () => api.submitBatchScore(file!, modelType),
    onSuccess: (data) => {
      setJobId(data.job_id);
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
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',');
      
      const parsedResults: BatchResultRow[] = lines.slice(1).map(line => {
        const values = line.split(',');
        return {
          age_years: Number(values[0]),
          income_total: Number(values[1]),
          credit_amount: Number(values[2]),
          annuity: Number(values[3]),
          family_members: Number(values[4]),
          num_active_loans: Number(values[5]),
          num_closed_loans: Number(values[6]),
          num_bureau_loans: Number(values[7]),
          max_delinquency: Number(values[8]),
          total_delinquency_months: Number(values[9]),
          pd: Number(values[10]),
          risk_score: Number(values[11]),
          risk_band: values[12] as any,
          expected_loss: Number(values[13]),
          decision: values[14] as any,
          reason_codes: values.slice(15).join(','),
        };
      });
      
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
          <div className="space-y-2">
            <Label>Model Type</Label>
            <Select
              value={modelType}
              onValueChange={(value: ModelType) => setModelType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="logistic">Logistic Regression</SelectItem>
                <SelectItem value="lightgbm">LightGBM</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                  <tr key={idx} className="hover:bg-muted/50">
                    <td className="p-2 text-muted-foreground">{idx + 1}</td>
                    <td className="p-2 text-right">{row.age_years}</td>
                    <td className="p-2 text-right">${row.income_total.toLocaleString()}</td>
                    <td className="p-2 text-right">${row.credit_amount.toLocaleString()}</td>
                    <td className="p-2 text-right">{(row.pd * 100).toFixed(2)}%</td>
                    <td className="p-2 text-right font-medium">{row.risk_score}</td>
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
                    <td className="p-2 text-right">${row.expected_loss.toLocaleString()}</td>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Approval Rate</p>
              <p className="text-lg font-semibold text-foreground">
                {((results.filter(r => r.decision === "Approve").length / results.length) * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg PD</p>
              <p className="text-lg font-semibold text-foreground">
                {((results.reduce((sum, r) => sum + r.pd, 0) / results.length) * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Risk Score</p>
              <p className="text-lg font-semibold text-foreground">
                {Math.round(results.reduce((sum, r) => sum + r.risk_score, 0) / results.length)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Exp. Loss</p>
              <p className="text-lg font-semibold text-foreground">
                ${results.reduce((sum, r) => sum + r.expected_loss, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
