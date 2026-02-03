import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { apiService } from "@/services/api";
import { PredictionResponse, ApplicantInput } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

export default function SingleApplicantScoring() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [formData, setFormData] = useState({
    // Add common fields - adjust based on your actual model features
    income: "",
    credit_score: "",
    loan_amount: "",
    employment_length: "",
    debt_to_income: "",
  });

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Convert string inputs to numbers where needed
      const processedData: ApplicantInput = {};
      Object.entries(formData).forEach(([key, value]) => {
        processedData[key] = isNaN(Number(value)) ? value : Number(value);
      });

      const response = await apiService.predictSingleApplicant(processedData);
      setResult(response);
      
      toast({
        title: "Scoring Complete",
        description: `Risk assessment completed successfully.`,
      });
    } catch (error) {
      toast({
        title: "Scoring Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskBandColor = (band: string) => {
    const lower = band.toLowerCase();
    if (lower.includes("low")) return "bg-green-500";
    if (lower.includes("medium")) return "bg-yellow-500";
    if (lower.includes("high")) return "bg-red-500";
    return "bg-gray-500";
  };

  const getDecisionIcon = (decision: string) => {
    const lower = decision.toLowerCase();
    if (lower.includes("approve")) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (lower.includes("reject") || lower.includes("decline")) return <XCircle className="h-5 w-5 text-red-600" />;
    return <AlertCircle className="h-5 w-5 text-yellow-600" />;
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Single Applicant Scoring</h1>
            <p className="text-muted-foreground">
              Score individual credit applications in real-time
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Applicant Information</CardTitle>
                <CardDescription>
                  Enter applicant details to calculate risk score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="income">Annual Income ($)</Label>
                    <Input
                      id="income"
                      type="number"
                      placeholder="75000"
                      value={formData.income}
                      onChange={(e) => handleInputChange("income", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credit_score">Credit Score</Label>
                    <Input
                      id="credit_score"
                      type="number"
                      placeholder="700"
                      min="300"
                      max="850"
                      value={formData.credit_score}
                      onChange={(e) => handleInputChange("credit_score", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loan_amount">Loan Amount ($)</Label>
                    <Input
                      id="loan_amount"
                      type="number"
                      placeholder="25000"
                      value={formData.loan_amount}
                      onChange={(e) => handleInputChange("loan_amount", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employment_length">Employment Length (years)</Label>
                    <Input
                      id="employment_length"
                      type="number"
                      placeholder="5"
                      value={formData.employment_length}
                      onChange={(e) => handleInputChange("employment_length", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="debt_to_income">Debt-to-Income Ratio (%)</Label>
                    <Input
                      id="debt_to_income"
                      type="number"
                      step="0.01"
                      placeholder="35.5"
                      value={formData.debt_to_income}
                      onChange={(e) => handleInputChange("debt_to_income", e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      "Calculate Risk Score"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment Results</CardTitle>
                <CardDescription>
                  {result ? "Scoring completed" : "Results will appear here"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-6">
                    {/* Decision */}
                    <Alert className="border-2">
                      <div className="flex items-center gap-3">
                        {getDecisionIcon(result.decision)}
                        <div>
                          <div className="font-semibold text-lg">{result.decision}</div>
                        </div>
                      </div>
                    </Alert>

                    <Separator />

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Probability of Default</p>
                        <p className="text-2xl font-bold">{(result.pd * 100).toFixed(2)}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Risk Score</p>
                        <p className="text-2xl font-bold">{result.risk_score.toFixed(0)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Risk Band</p>
                        <Badge className={getRiskBandColor(result.risk_band)}>
                          {result.risk_band}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Expected Loss</p>
                        <p className="text-2xl font-bold">
                          ${result.expected_loss.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Reason Codes */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Why this decision?</h4>
                      <div className="space-y-2">
                        {result.reason_codes.map((reason, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm"
                          >
                            <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <AlertCircle className="mx-auto mb-2 h-12 w-12 opacity-20" />
                      <p>No results yet. Fill in the form and click Calculate.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
