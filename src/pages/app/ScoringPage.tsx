import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api.ts";
import type { ApplicantInput, PredictionResponse, ModelType } from "@/types/api";
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
import { Loader2, Calculator, AlertCircle } from "lucide-react";
import { RiskBandBadge, DecisionBadge } from "@/components/common/Badges";

const scoringSchema = z.object({
  age_years: z.coerce.number().min(18, "Must be at least 18").max(100, "Must be at most 100"),
  income_total: z.coerce.number().positive("Must be greater than 0"),
  credit_amount: z.coerce.number().positive("Must be greater than 0"),
  annuity: z.coerce.number().min(0, "Must be 0 or greater"),
  family_members: z.coerce.number().min(1, "Must be at least 1"),
  num_active_loans: z.coerce.number().min(0, "Must be 0 or greater"),
  num_closed_loans: z.coerce.number().min(0, "Must be 0 or greater"),
  num_bureau_loans: z.coerce.number().min(0, "Must be 0 or greater"),
  max_delinquency: z.coerce.number().min(0, "Must be 0 or greater"),
  total_delinquency_months: z.coerce.number().min(0, "Must be 0 or greater"),
  model_type: z.enum(["logistic", "lightgbm"]),
});

type ScoringFormData = z.infer<typeof scoringSchema>;

export default function ScoringPage() {
  const { toast } = useToast();
  const [result, setResult] = useState<PredictionResponse | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ScoringFormData>({
    resolver: zodResolver(scoringSchema),
    defaultValues: {
      model_type: "logistic",
      age_years: undefined,
      income_total: undefined,
      credit_amount: undefined,
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
    mutationFn: (data: ApplicantInput) => api.predict(data),
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Scoring Complete",
        description: `Application ${data.application_id} scored successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Scoring Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ScoringFormData) => {
    setResult(null);
    mutation.mutate(data as ApplicantInput);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Single Applicant Scoring
        </h1>
        <p className="text-muted-foreground">
          Assess credit risk for an individual applicant
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="bg-card border border-border rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Model Selection */}
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

            {/* Demographics */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Demographics
              </h3>
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
                  {errors.age_years && (
                    <p className="text-xs text-destructive">
                      {errors.age_years.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="family_members">Family Members</Label>
                  <Input
                    id="family_members"
                    type="number"
                    placeholder="1+"
                    {...register("family_members")}
                    className={errors.family_members ? "border-destructive" : ""}
                  />
                  {errors.family_members && (
                    <p className="text-xs text-destructive">
                      {errors.family_members.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Financial Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="income_total">Total Income ($)</Label>
                  <Input
                    id="income_total"
                    type="number"
                    placeholder="Annual income"
                    {...register("income_total")}
                    className={errors.income_total ? "border-destructive" : ""}
                  />
                  {errors.income_total && (
                    <p className="text-xs text-destructive">
                      {errors.income_total.message}
                    </p>
                  )}
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
                  {errors.credit_amount && (
                    <p className="text-xs text-destructive">
                      {errors.credit_amount.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annuity">Annuity ($)</Label>
                  <Input
                    id="annuity"
                    type="number"
                    placeholder="Monthly payment"
                    {...register("annuity")}
                    className={errors.annuity ? "border-destructive" : ""}
                  />
                  {errors.annuity && (
                    <p className="text-xs text-destructive">
                      {errors.annuity.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Credit History */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Credit History
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="num_active_loans">Active Loans</Label>
                  <Input
                    id="num_active_loans"
                    type="number"
                    placeholder="0"
                    {...register("num_active_loans")}
                    className={errors.num_active_loans ? "border-destructive" : ""}
                  />
                  {errors.num_active_loans && (
                    <p className="text-xs text-destructive">
                      {errors.num_active_loans.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num_closed_loans">Closed Loans</Label>
                  <Input
                    id="num_closed_loans"
                    type="number"
                    placeholder="0"
                    {...register("num_closed_loans")}
                    className={errors.num_closed_loans ? "border-destructive" : ""}
                  />
                  {errors.num_closed_loans && (
                    <p className="text-xs text-destructive">
                      {errors.num_closed_loans.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num_bureau_loans">Bureau Loans</Label>
                  <Input
                    id="num_bureau_loans"
                    type="number"
                    placeholder="0"
                    {...register("num_bureau_loans")}
                    className={errors.num_bureau_loans ? "border-destructive" : ""}
                  />
                  {errors.num_bureau_loans && (
                    <p className="text-xs text-destructive">
                      {errors.num_bureau_loans.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Delinquency */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Delinquency Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max_delinquency">Max Delinquency</Label>
                  <Input
                    id="max_delinquency"
                    type="number"
                    placeholder="0"
                    {...register("max_delinquency")}
                    className={errors.max_delinquency ? "border-destructive" : ""}
                  />
                  {errors.max_delinquency && (
                    <p className="text-xs text-destructive">
                      {errors.max_delinquency.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_delinquency_months">
                    Total Delinquency (months)
                  </Label>
                  <Input
                    id="total_delinquency_months"
                    type="number"
                    placeholder="0"
                    {...register("total_delinquency_months")}
                    className={
                      errors.total_delinquency_months ? "border-destructive" : ""
                    }
                  />
                  {errors.total_delinquency_months && (
                    <p className="text-xs text-destructive">
                      {errors.total_delinquency_months.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scoring...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Score Applicant
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Scoring Results
          </h2>

          {!result && !mutation.isPending && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Calculator className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Fill in the applicant details and click "Score Applicant" to see
                results.
              </p>
            </div>
          )}

          {mutation.isPending && (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Processing application...</p>
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

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    PD
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {(result.pd * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Risk Score
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {result.risk_score}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Risk Band
                  </p>
                  <div className="mt-1">
                    <RiskBandBadge band={result.risk_band} />
                  </div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Expected Loss
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    ${result.expected_loss.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Decision */}
              <div className="p-4 border border-border rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Decision
                </p>
                <DecisionBadge decision={result.decision} className="text-sm" />
              </div>

              {/* Reason Codes */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Reason Codes
                </p>
                <ul className="space-y-2">
                  {result.reason_codes.map((code, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      {code}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
