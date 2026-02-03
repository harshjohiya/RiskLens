import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Lightbulb, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { apiService } from "@/services/api";
import { ExplainabilityResponse } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

export default function Explainability() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [applicationId, setApplicationId] = useState(searchParams.get("id") || "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ExplainabilityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setApplicationId(id);
      loadExplanation(id);
    }
  }, []);

  const loadExplanation = async (id: string) => {
    if (!id.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter an application ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getExplanation(id);
      setData(response);
      setSearchParams({ id });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load explanation";
      setError(message);
      setData(null);
      toast({
        title: "Error Loading Explanation",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadExplanation(applicationId);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Explainability</h1>
            <p className="text-muted-foreground">
              Understand the factors behind credit risk decisions
            </p>
          </div>

          {/* Search Card */}
          <Card>
            <CardHeader>
              <CardTitle>Lookup Application</CardTitle>
              <CardDescription>
                Enter an application ID to view its risk decision explanation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="application_id">Application ID</Label>
                  <Input
                    id="application_id"
                    placeholder="e.g., app_12345abcde"
                    value={applicationId}
                    onChange={(e) => setApplicationId(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="mt-8" disabled={loading}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : data ? (
            <div className="space-y-6">
              {/* Application Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Application Details</CardTitle>
                      <CardDescription className="mt-1">
                        ID: <span className="font-mono">{data.application_id}</span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="gap-2">
                      <Lightbulb className="h-3 w-3" />
                      Explainability Report
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Decision Factors */}
              <Card>
                <CardHeader>
                  <CardTitle>Decision Factors</CardTitle>
                  <CardDescription>
                    Key reasons influencing the risk assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.reason_codes.map((reason, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Feature Importance (if available) */}
              {data.feature_importance && data.feature_importance.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Feature Importance</CardTitle>
                    <CardDescription>
                      Impact of individual features on the risk score
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.feature_importance
                        .sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance))
                        .map((feature, index) => {
                          const isPositive = feature.importance > 0;
                          const absImportance = Math.abs(feature.importance);
                          const maxImportance = Math.max(
                            ...data.feature_importance!.map((f) => Math.abs(f.importance))
                          );
                          const widthPercent = (absImportance / maxImportance) * 100;

                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{feature.feature}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {feature.value}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  {isPositive ? (
                                    <TrendingUp className="h-3 w-3 text-red-500" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 text-green-500" />
                                  )}
                                  <span>{absImportance.toFixed(3)}</span>
                                </div>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                  className={`h-full transition-all ${
                                    isPositive ? "bg-red-500" : "bg-green-500"
                                  }`}
                                  style={{ width: `${widthPercent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    <Separator className="my-6" />

                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm bg-red-500" />
                        <span className="text-muted-foreground">Increases Risk</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm bg-green-500" />
                        <span className="text-muted-foreground">Decreases Risk</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Disclaimer */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This explanation provides insights into the model's decision-making process.
                  It should be used as a guide and reviewed by qualified credit analysts for
                  final decision-making.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <Card>
              <CardContent className="flex h-64 items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Lightbulb className="mx-auto mb-2 h-12 w-12 opacity-20" />
                  <p>Enter an application ID to view its explanation</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
