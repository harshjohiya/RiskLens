import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Code, Copy, Key, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ApiAccess() {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Access</h1>
            <p className="text-muted-foreground">
              Integrate RiskLens credit risk API into your applications
            </p>
          </div>

          {/* API Key */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Key
              </CardTitle>
              <CardDescription>
                Use this key to authenticate your API requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value="sk_live_1234567890abcdefghijklmnopqrstuvwxyz"
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handleCopy("sk_live_1234567890abcdefghijklmnopqrstuvwxyz", "API Key")
                  }
                >
                  {copied === "API Key" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Keep your API key secure and never share it publicly
              </p>
            </CardContent>
          </Card>

          {/* Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                Available REST API endpoints for credit risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Single Prediction */}
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Single Applicant Scoring</h3>
                  <Badge variant="outline">POST</Badge>
                </div>
                <code className="block rounded bg-muted p-2 text-sm">
                  POST /api/predict
                </code>
                <p className="text-sm text-muted-foreground">
                  Score a single credit application and receive risk assessment
                </p>
              </div>

              {/* Batch Scoring */}
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Batch Scoring</h3>
                  <Badge variant="outline">POST</Badge>
                </div>
                <code className="block rounded bg-muted p-2 text-sm">
                  POST /api/batch-score
                </code>
                <p className="text-sm text-muted-foreground">
                  Upload CSV file for bulk application scoring
                </p>
              </div>

              {/* Portfolio Summary */}
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Portfolio Summary</h3>
                  <Badge variant="outline">GET</Badge>
                </div>
                <code className="block rounded bg-muted p-2 text-sm">
                  GET /api/portfolio/summary
                </code>
                <p className="text-sm text-muted-foreground">
                  Retrieve aggregated portfolio risk metrics and analytics
                </p>
              </div>

              {/* History */}
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Application History</h3>
                  <Badge variant="outline">GET</Badge>
                </div>
                <code className="block rounded bg-muted p-2 text-sm">
                  GET /api/history
                </code>
                <p className="text-sm text-muted-foreground">
                  Access historical scoring records with filtering options
                </p>
              </div>

              {/* Explainability */}
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Explainability</h3>
                  <Badge variant="outline">GET</Badge>
                </div>
                <code className="block rounded bg-muted p-2 text-sm">
                  GET /api/explain/:application_id
                </code>
                <p className="text-sm text-muted-foreground">
                  Get detailed explanation for a specific risk decision
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Code Example */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Example Request
              </CardTitle>
              <CardDescription>
                Sample code for scoring a single applicant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-50">
                  <code>{`const response = await fetch('http://localhost:8000/api/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    income: 75000,
    credit_score: 700,
    loan_amount: 25000,
    employment_length: 5,
    debt_to_income: 35.5
  })
});

const result = await response.json();
console.log(result);
// {
//   pd: 0.156,
//   risk_score: 680,
//   risk_band: "Medium",
//   expected_loss: 3900,
//   decision: "Approved",
//   reason_codes: [...]
// }`}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() =>
                    handleCopy(
                      `const response = await fetch('http://localhost:8000/api/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    income: 75000,
    credit_score: 700,
    loan_amount: 25000,
    employment_length: 5,
    debt_to_income: 35.5
  })
});`,
                      "Code example"
                    )
                  }
                >
                  {copied === "Code example" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Rate Limits</CardTitle>
              <CardDescription>API usage limits for your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requests per minute:</span>
                  <span className="font-medium">100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requests per day:</span>
                  <span className="font-medium">10,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Concurrent batch jobs:</span>
                  <span className="font-medium">5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
