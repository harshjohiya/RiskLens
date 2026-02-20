import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ThresholdSettings } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings2, CheckCircle2, Loader2, ShieldAlert, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: thresholds, isLoading } = useQuery({
    queryKey: ["threshold-settings"],
    queryFn: () => api.getThresholdSettings(),
  });

  const [form, setForm] = useState<ThresholdSettings>({
    band_a_min: 650,
    band_b_min: 600,
    band_c_min: 550,
    el_loss_rate: 0.45,
  });

  useEffect(() => {
    if (thresholds) setForm(thresholds);
  }, [thresholds]);

  const mutation = useMutation({
    mutationFn: (data: ThresholdSettings) => api.updateThresholdSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threshold-settings"] });
      toast({ title: "Settings Saved", description: "Scoring thresholds updated successfully." });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const handleChange = (key: keyof ThresholdSettings, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === "el_loss_rate" ? parseFloat(value) || 0 : parseInt(value) || 0,
    }));
  };

  const handleSave = () => {
    if (form.band_a_min <= form.band_b_min) {
      toast({ title: "Validation Error", description: "Band A min must be greater than Band B min.", variant: "destructive" });
      return;
    }
    if (form.band_b_min <= form.band_c_min) {
      toast({ title: "Validation Error", description: "Band B min must be greater than Band C min.", variant: "destructive" });
      return;
    }
    if (form.el_loss_rate <= 0 || form.el_loss_rate > 1) {
      toast({ title: "Validation Error", description: "LGD rate must be between 0 and 1.", variant: "destructive" });
      return;
    }
    mutation.mutate(form);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure model and scoring parameters</p>
      </div>

      {/* Active Model Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Model Configuration</h2>
            <p className="text-sm text-muted-foreground">Active scoring model</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-4 border border-primary/40 bg-primary/5 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-status-success flex-shrink-0" />
          <div>
            <div className="font-medium text-foreground">LightGBM</div>
            <div className="text-sm text-muted-foreground">
              High-performance gradient boosting — active model for all scoring
            </div>
          </div>
        </div>
      </div>

      {/* Risk Band Thresholds */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Risk Band Thresholds</h2>
            <p className="text-sm text-muted-foreground">
              Minimum score required to qualify for each risk band (A is best)
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="band_a_min">
                Band A min score
                <span className="ml-2 text-xs text-status-success font-medium">Approve</span>
              </Label>
              <Input
                id="band_a_min"
                type="number"
                min={500}
                max={999}
                value={form.band_a_min}
                onChange={(e) => handleChange("band_a_min", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="band_b_min">
                Band B min score
                <span className="ml-2 text-xs text-yellow-500 font-medium">Approve</span>
              </Label>
              <Input
                id="band_b_min"
                type="number"
                min={400}
                max={998}
                value={form.band_b_min}
                onChange={(e) => handleChange("band_b_min", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="band_c_min">
                Band C min score
                <span className="ml-2 text-xs text-orange-500 font-medium">Manual Review</span>
              </Label>
              <Input
                id="band_c_min"
                type="number"
                min={300}
                max={997}
                value={form.band_c_min}
                onChange={(e) => handleChange("band_c_min", e.target.value)}
              />
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-3">
          Scores below Band C min → <span className="text-destructive font-medium">Reject</span>
        </p>
      </div>

      {/* EL / LGD Rate */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Expected Loss Parameters</h2>
            <p className="text-sm text-muted-foreground">
              Loss Given Default (LGD) used in EL = PD × LGD × Exposure
            </p>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-10 w-48" />
        ) : (
          <div className="flex items-end gap-4">
            <div className="space-y-2 w-48">
              <Label htmlFor="el_loss_rate">LGD Rate (0–1)</Label>
              <Input
                id="el_loss_rate"
                type="number"
                min={0.01}
                max={1}
                step={0.01}
                value={form.el_loss_rate}
                onChange={(e) => handleChange("el_loss_rate", e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground pb-2">
              e.g. 0.45 means 45% of exposure is lost on default
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={mutation.isPending || isLoading} className="min-w-32">
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
