import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import type { ApplicantInput, ExplainabilityResponse, ModelType } from "@/types/api";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const explainSchema = z.object({
  age_years: z.coerce.number().min(18).max(100),
  income_total: z.coerce.number().positive(),
  credit_amount: z.coerce.number().positive(),
  annuity: z.coerce.number().min(0),
  family_members: z.coerce.number().min(1),
  num_active_loans: z.coerce.number().min(0),
  num_closed_loans: z.coerce.number().min(0),
  num_bureau_loans: z.coerce.number().min(0),
  max_delinquency: z.coerce.number().min(0),
  total_delinquency_months: z.coerce.number().min(0),
  model_type: z.enum(["logistic", "lightgbm"]),
});

type ExplainFormData = z.infer<typeof explainSchema>;

export default function ExplainPage() {
  const { toast } = useToast();
  const [result, setResult] = useState<ExplainabilityResponse | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExplainFormData>({
    resolver: zodResolver(explainSchema),
    defaultValues: {
      model_type: "logistic",
      annuity: 0,
      family_members: 1,
      num_active_loans: 0,
      num_closed_loans: 0,
      num_bureau_loans: 0,
      max_delinquency: 0,
      total_delinquency_months: 0,
    },
  });

  const modelType = watch("model_type");

  const mutation = useMutation({
    mutationFn: (data: ApplicantInput) => api.explain(data),
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Analysis Complete",
        description: "Risk factor breakdown generated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExplainFormData) => {
    setResult(null);
    mutation.mutate(data as ApplicantInput);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Explainability</h1>
        <p className="text-muted-foreground">
          Understand the factors driving credit decisions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="bg-card border border-border rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="model_type">Model Type</Label>
              <Select
                value={modelType}
                onValueChange={(value: ModelType) =>
                  setValue("model_type", value)
                }
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="age_years">Age (years)</Label>
                <Input
                  id="age_years"
                  type="number"
                  placeholder="18-100"
                  {...register("age_years")}
                  className={errors.age_years ? "border-destructive" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income_total">Total Income ($)</Label>
                <Input
                  id="income_total"
                  type="number"
                  placeholder="Annual income"
                  {...register("income_total")}
                  className={errors.income_total ? "border-destructive" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credit_amount">Credit Amount ($)</Label>
                <Input
                  id="credit_amount"
                  type="number"
                  placeholder="Requested amount"
                  {...register("credit_amount")}
                  className={errors.credit_amount ? "border-destructive" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annuity">Annuity ($)</Label>
                <Input
                  id="annuity"
                  type="number"
                  placeholder="0"
                  {...register("annuity")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="family_members">Family Members</Label>
                <Input
                  id="family_members"
                  type="number"
                  placeholder="1"
                  {...register("family_members")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="num_active_loans">Active Loans</Label>
                <Input
                  id="num_active_loans"
                  type="number"
                  placeholder="0"
                  {...register("num_active_loans")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="num_closed_loans">Closed Loans</Label>
                <Input
                  id="num_closed_loans"
                  type="number"
                  placeholder="0"
                  {...register("num_closed_loans")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="num_bureau_loans">Bureau Loans</Label>
                <Input
                  id="num_bureau_loans"
                  type="number"
                  placeholder="0"
                  {...register("num_bureau_loans")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_delinquency">Max Delinquency</Label>
                <Input
                  id="max_delinquency"
                  type="number"
                  placeholder="0"
                  {...register("max_delinquency")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_delinquency_months">
                  Delinquency Months
                </Label>
                <Input
                  id="total_delinquency_months"
                  type="number"
                  placeholder="0"
                  {...register("total_delinquency_months")}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Explanation
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Results */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Explanation Results
          </h2>

          {!result && !mutation.isPending && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Enter applicant details and click "Generate Explanation" to see
                the risk factor breakdown.
              </p>
            </div>
          )}

          {mutation.isPending && (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Analyzing risk factors...</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-fade-in">
              {/* Application ID */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Application ID
                </p>
                <p className="font-mono text-sm text-foreground">
                  {result.application_id}
                </p>
              </div>

              {/* Reason Codes */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">
                  Reason Codes
                </p>
                <ul className="space-y-2">
                  {result.reason_codes.map((code, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-foreground p-3 bg-muted/30 rounded-lg"
                    >
                      <AlertCircle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
                      {code}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Factors */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">
                  Risk Factor Breakdown
                </p>
                <div className="space-y-3">
                  {result.risk_factors.map((factor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {factor.direction === "positive" ? (
                          <TrendingUp className="w-4 h-4 text-status-error" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-status-success" />
                        )}
                        <span className="text-sm text-foreground">
                          {factor.feature}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "text-sm font-mono font-medium",
                          factor.direction === "positive"
                            ? "text-status-error"
                            : "text-status-success"
                        )}
                      >
                        {factor.direction === "positive" ? "+" : "-"}
                        {Math.abs(factor.contribution).toFixed(3)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
