import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  Download, 
  FileUp, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { apiService } from "@/services/api";
import { BatchScoreResponse } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

type UploadStatus = "idle" | "uploading" | "processing" | "completed" | "error";

export default function BatchScoring() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [result, setResult] = useState<BatchScoreResponse | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setStatus("idle");
      setError(null);
      setResult(null);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setStatus("uploading");
      setProgress(30);
      setError(null);

      const response = await apiService.uploadBatchFile(file);
      
      setProgress(60);
      setStatus("processing");
      
      // Poll for status if needed
      if (response.status === "processing") {
        await pollBatchStatus(response.job_id);
      } else {
        setResult(response);
        setStatus("completed");
        setProgress(100);
        
        toast({
          title: "Batch Processing Complete",
          description: `Processed ${response.processed_count} of ${response.total_count} records`,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      setStatus("error");
      setProgress(0);
      
      toast({
        title: "Upload Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const pollBatchStatus = async (jobId: string) => {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await apiService.getBatchScoreStatus(jobId);
        
        if (response.status === "completed") {
          setResult(response);
          setStatus("completed");
          setProgress(100);
          
          toast({
            title: "Batch Processing Complete",
            description: `Processed ${response.processed_count} of ${response.total_count} records`,
          });
          return;
        }

        if (response.status === "failed") {
          throw new Error("Batch processing failed");
        }

        // Update progress
        if (response.processed_count && response.total_count) {
          const progressPercent = (response.processed_count / response.total_count) * 100;
          setProgress(Math.min(progressPercent, 95));
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          throw new Error("Processing timeout");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Processing failed";
        setError(message);
        setStatus("error");
        setProgress(0);
        
        toast({
          title: "Processing Failed",
          description: message,
          variant: "destructive",
        });
      }
    };

    poll();
  };

  const handleDownload = async () => {
    if (!result?.download_url) return;

    try {
      const blob = await apiService.downloadBatchResults(result.download_url);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `batch_results_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Started",
        description: "Your results file is downloading",
      });
    } catch (err) {
      toast({
        title: "Download Failed",
        description: err instanceof Error ? err.message : "Failed to download results",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setResult(null);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "uploading":
      case "processing":
        return <Loader2 className="h-8 w-8 animate-spin text-blue-600" />;
      case "completed":
        return <CheckCircle2 className="h-8 w-8 text-green-600" />;
      case "error":
        return <XCircle className="h-8 w-8 text-red-600" />;
      default:
        return <FileUp className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "uploading":
        return "Uploading file...";
      case "processing":
        return "Processing applications...";
      case "completed":
        return "Processing complete!";
      case "error":
        return error || "An error occurred";
      default:
        return "Upload a CSV file to begin batch scoring";
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Batch Scoring</h1>
            <p className="text-muted-foreground">
              Upload a CSV file to score multiple applications at once
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload Applications</CardTitle>
              <CardDescription>
                Upload a CSV file containing applicant information. Each row will be scored individually.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors hover:border-primary"
                onClick={() => status === "idle" && fileInputRef.current?.click()}
              >
                {getStatusIcon()}
                <p className="mt-4 text-lg font-medium">{getStatusMessage()}</p>
                
                {file && status === "idle" && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                    <Badge variant="secondary">
                      {(file.size / 1024).toFixed(2)} KB
                    </Badge>
                  </div>
                )}

                {status === "idle" && !file && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click to browse or drag and drop your CSV file here
                  </p>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={status !== "idle"}
                />
              </div>

              {/* Progress Bar */}
              {(status === "uploading" || status === "processing") && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-center text-sm text-muted-foreground">
                    {progress.toFixed(0)}% complete
                  </p>
                </div>
              )}

              {/* Error Alert */}
              {status === "error" && error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Results Summary */}
              {status === "completed" && result && (
                <Alert className="border-green-600 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-900">
                    Successfully processed {result.processed_count} of {result.total_count} applications
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={!file || status === "uploading" || status === "processing"}
                  className="flex-1"
                >
                  {status === "uploading" || status === "processing" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Start Batch Scoring
                    </>
                  )}
                </Button>

                {status === "completed" && result?.download_url && (
                  <Button onClick={handleDownload} variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download Results
                  </Button>
                )}

                {(file || status === "completed" || status === "error") && (
                  <Button onClick={handleReset} variant="outline">
                    Reset
                  </Button>
                )}
              </div>

              {/* Instructions */}
              <div className="rounded-lg bg-muted p-4 text-sm">
                <h4 className="mb-2 font-semibold">CSV Format Requirements:</h4>
                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                  <li>First row must contain column headers</li>
                  <li>Include all required applicant fields</li>
                  <li>Use consistent data types (numbers for numeric fields)</li>
                  <li>Maximum file size: 10MB</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
