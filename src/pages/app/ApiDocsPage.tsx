import { Code, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  description: string;
  requestBody?: string;
  responseBody: string;
  statusCodes: { code: number; description: string }[];
}

const endpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/health",
    description: "Check API health status and service availability",
    responseBody: `{
  "status": "healthy",
  "database": "connected",
  "model_service": "available",
  "timestamp": "2024-01-15T10:30:00Z"
}`,
    statusCodes: [
      { code: 200, description: "Service is healthy" },
      { code: 503, description: "Service unavailable" },
    ],
  },
  {
    method: "POST",
    path: "/predict",
    description: "Score a single applicant and get credit risk prediction",
    requestBody: `{
  "age_years": 35,
  "income_total": 75000,
  "credit_amount": 25000,
  "annuity": 1250,
  "family_members": 3,
  "num_active_loans": 1,
  "num_closed_loans": 2,
  "num_bureau_loans": 3,
  "max_delinquency": 0,
  "total_delinquency_months": 0,
  "model_type": "logistic"
}`,
    responseBody: `{
  "application_id": "APP-2024-001234",
  "pd": 0.0342,
  "risk_score": 720,
  "risk_band": "A",
  "expected_loss": 855.00,
  "decision": "Approve",
  "reason_codes": [
    "Good credit history",
    "Stable income relative to credit"
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}`,
    statusCodes: [
      { code: 200, description: "Prediction successful" },
      { code: 400, description: "Invalid input data" },
      { code: 500, description: "Model error" },
    ],
  },
  {
    method: "GET",
    path: "/portfolio/summary",
    description: "Get aggregated portfolio risk metrics and distributions",
    responseBody: `{
  "total_applications": 15420,
  "approval_rate": 0.72,
  "average_pd": 0.0456,
  "total_expected_loss": 2340000.00,
  "risk_band_distribution": [
    { "band": "A", "count": 6168, "percentage": 0.40 },
    { "band": "B", "count": 4626, "percentage": 0.30 },
    { "band": "C", "count": 3084, "percentage": 0.20 },
    { "band": "D", "count": 1542, "percentage": 0.10 }
  ],
  "expected_loss_by_band": [
    { "band": "A", "expected_loss": 234000.00 },
    { "band": "B", "expected_loss": 585000.00 },
    { "band": "C", "expected_loss": 702000.00 },
    { "band": "D", "expected_loss": 819000.00 }
  ]
}`,
    statusCodes: [
      { code: 200, description: "Summary retrieved" },
      { code: 500, description: "Database error" },
    ],
  },
  {
    method: "POST",
    path: "/batch-score?model_type=logistic",
    description: "Submit a CSV file for batch scoring",
    requestBody: "Content-Type: multipart/form-data\nfile: <CSV file>",
    responseBody: `{
  "job_id": "JOB-2024-005678",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z"
}`,
    statusCodes: [
      { code: 202, description: "Job accepted" },
      { code: 400, description: "Invalid CSV format" },
    ],
  },
  {
    method: "GET",
    path: "/batch-score/{job_id}",
    description: "Check status of a batch scoring job",
    responseBody: `{
  "job_id": "JOB-2024-005678",
  "status": "completed",
  "total_records": 1000,
  "processed_records": 1000,
  "download_url": "/batch-score/JOB-2024-005678/download",
  "created_at": "2024-01-15T10:30:00Z",
  "completed_at": "2024-01-15T10:35:00Z"
}`,
    statusCodes: [
      { code: 200, description: "Status retrieved" },
      { code: 404, description: "Job not found" },
    ],
  },
  {
    method: "GET",
    path: "/history",
    description: "Get paginated history of scored applications with filters",
    responseBody: `{
  "records": [
    {
      "application_id": "APP-2024-001234",
      "timestamp": "2024-01-15T10:30:00Z",
      "risk_band": "A",
      "decision": "Approve",
      "pd": 0.0342,
      "risk_score": 720,
      "expected_loss": 855.00
    }
  ],
  "total": 15420,
  "page": 1,
  "page_size": 10,
  "total_pages": 1542
}`,
    statusCodes: [
      { code: 200, description: "History retrieved" },
      { code: 400, description: "Invalid filter parameters" },
    ],
  },
  {
    method: "POST",
    path: "/explain",
    description: "Get detailed explanation of risk factors for an applicant",
    requestBody: `{
  "age_years": 35,
  "income_total": 75000,
  "credit_amount": 25000,
  ...
  "model_type": "logistic"
}`,
    responseBody: `{
  "application_id": "APP-2024-001234",
  "reason_codes": [
    "High credit utilization ratio",
    "Recent delinquency history"
  ],
  "risk_factors": [
    { "feature": "credit_amount", "contribution": 0.15, "direction": "positive" },
    { "feature": "income_total", "contribution": -0.08, "direction": "negative" }
  ]
}`,
    statusCodes: [
      { code: 200, description: "Explanation generated" },
      { code: 400, description: "Invalid input data" },
    ],
  },
  {
    method: "GET",
    path: "/settings/model",
    description: "Get current model configuration",
    responseBody: `{
  "active_model": "logistic",
  "available_models": ["logistic", "lightgbm"],
  "last_updated": "2024-01-15T10:30:00Z"
}`,
    statusCodes: [{ code: 200, description: "Settings retrieved" }],
  },
  {
    method: "POST",
    path: "/settings/model",
    description: "Update the active model configuration",
    requestBody: `{
  "active_model": "lightgbm"
}`,
    responseBody: `{
  "active_model": "lightgbm",
  "available_models": ["logistic", "lightgbm"],
  "last_updated": "2024-01-15T10:35:00Z"
}`,
    statusCodes: [
      { code: 200, description: "Settings updated" },
      { code: 400, description: "Invalid model type" },
    ],
  },
];

function CodeBlock({ code, language = "json" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="p-4 bg-muted/50 rounded-lg overflow-x-auto text-sm font-mono text-foreground">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? (
          <CheckCircle2 className="h-4 w-4 text-status-success" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">API Documentation</h1>
        <p className="text-muted-foreground">
          Complete reference for the RiskLens API endpoints
        </p>
      </div>

      {/* Base URL */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Base URL</h2>
        <CodeBlock code="https://api.risklens.com/v1" />
        <p className="text-sm text-muted-foreground mt-2">
          All endpoints are relative to this base URL. Authentication is handled
          via API keys in the Authorization header.
        </p>
      </div>

      {/* Endpoints */}
      <div className="space-y-6">
        {endpoints.map((endpoint, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg overflow-hidden"
          >
            {/* Endpoint Header */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-bold uppercase",
                    endpoint.method === "GET"
                      ? "bg-status-success/10 text-status-success"
                      : "bg-status-info/10 text-status-info"
                  )}
                >
                  {endpoint.method}
                </span>
                <code className="text-sm font-mono text-foreground">
                  {endpoint.path}
                </code>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {endpoint.description}
              </p>
            </div>

            {/* Endpoint Body */}
            <div className="p-4 space-y-4">
              {endpoint.requestBody && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Request Body
                  </h4>
                  <CodeBlock code={endpoint.requestBody} />
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Response
                </h4>
                <CodeBlock code={endpoint.responseBody} />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Status Codes
                </h4>
                <div className="space-y-1">
                  {endpoint.statusCodes.map((status) => (
                    <div
                      key={status.code}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span
                        className={cn(
                          "font-mono px-2 py-0.5 rounded",
                          status.code < 300
                            ? "bg-status-success/10 text-status-success"
                            : status.code < 500
                            ? "bg-status-warning/10 text-status-warning"
                            : "bg-status-error/10 text-status-error"
                        )}
                      >
                        {status.code}
                      </span>
                      <span className="text-muted-foreground">
                        {status.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
