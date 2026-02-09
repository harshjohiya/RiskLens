import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api.ts";
import type { ModelType } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings2, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/States";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingModel, setPendingModel] = useState<ModelType | null>(null);

  const { data: settings, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["model-settings"],
    queryFn: () => api.getModelSettings(),
    retry: 2,
  });

  const mutation = useMutation({
    mutationFn: (modelType: ModelType) => api.updateModelSettings(modelType),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["model-settings"] });
      toast({
        title: "Settings Updated",
        description: `Active model changed to ${data.active_model === "logistic" ? "Logistic Regression" : "LightGBM"}`,
      });
      setPendingModel(null);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleModelChange = (value: ModelType) => {
    if (value !== settings?.active_model) {
      setPendingModel(value);
    }
  };

  const confirmModelChange = () => {
    if (pendingModel) {
      mutation.mutate(pendingModel);
    }
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Configure model and system preferences
          </p>
        </div>
        <ErrorState
          message={error instanceof Error ? error.message : "Failed to load settings"}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Configure model and system preferences
        </p>
      </div>

      {/* Model Settings */}
      <div className="bg-card border border-border rounded-lg p-6 max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Model Configuration
            </h2>
            <p className="text-sm text-muted-foreground">
              Select the default model for scoring
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <>
            <RadioGroup
              value={settings?.active_model}
              onValueChange={(value) => handleModelChange(value as ModelType)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="logistic" id="logistic" />
                <Label
                  htmlFor="logistic"
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium text-foreground">
                    Logistic Regression
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Fast, interpretable model suitable for regulatory compliance
                  </div>
                </Label>
                {settings?.active_model === "logistic" && (
                  <CheckCircle2 className="w-5 h-5 text-status-success" />
                )}
              </div>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="lightgbm" id="lightgbm" />
                <Label
                  htmlFor="lightgbm"
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium text-foreground">LightGBM</div>
                  <div className="text-sm text-muted-foreground">
                    High-performance gradient boosting for maximum accuracy
                  </div>
                </Label>
                {settings?.active_model === "lightgbm" && (
                  <CheckCircle2 className="w-5 h-5 text-status-success" />
                )}
              </div>
            </RadioGroup>

            {settings?.last_updated && (
              <p className="text-sm text-muted-foreground mt-4">
                Last updated: {new Date(settings.last_updated).toLocaleString()}
              </p>
            )}
          </>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog
          open={!!pendingModel}
          onOpenChange={(open) => !open && setPendingModel(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change Active Model?</AlertDialogTitle>
              <AlertDialogDescription>
                This will change the default model used for all new scoring
                requests to{" "}
                <strong>
                  {pendingModel === "logistic"
                    ? "Logistic Regression"
                    : "LightGBM"}
                </strong>
                . Existing scores will not be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmModelChange}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Confirm Change"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
