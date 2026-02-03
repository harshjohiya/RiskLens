import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertTriangle, 
  Save, 
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { apiService } from "@/services/api";
import { ModelSettings } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ModelSettings | null>(null);
  const [selectedModel, setSelectedModel] = useState<'logistic' | 'lightgbm'>('logistic');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getModelSettings();
      setSettings(response);
      setSelectedModel(response.active_model);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load settings";
      setError(message);
      toast({
        title: "Error Loading Settings",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value as 'logistic' | 'lightgbm');
    if (settings && value !== settings.active_model) {
      setShowConfirmDialog(true);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings || selectedModel === settings.active_model) {
      setShowConfirmDialog(false);
      return;
    }

    try {
      setSaving(true);
      const response = await apiService.updateModelSettings({
        active_model: selectedModel,
      });
      setSettings(response);
      setShowConfirmDialog(false);
      
      toast({
        title: "Settings Saved",
        description: `Model switched to ${selectedModel === 'logistic' ? 'Logistic Regression' : 'LightGBM'}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save settings";
      toast({
        title: "Error Saving Settings",
        description: message,
        variant: "destructive",
      });
      // Revert selection on error
      setSelectedModel(settings.active_model);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelChange = () => {
    if (settings) {
      setSelectedModel(settings.active_model);
    }
    setShowConfirmDialog(false);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Configure your risk assessment model and preferences
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Model Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Model Selection</CardTitle>
              <CardDescription>
                Choose the machine learning model for credit risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <>
                  <RadioGroup value={selectedModel} onValueChange={handleModelChange}>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                        <RadioGroupItem value="logistic" id="logistic" className="mt-1" />
                        <div className="flex-1 space-y-1">
                          <Label htmlFor="logistic" className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Logistic Regression</span>
                              {settings?.active_model === 'logistic' && (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Traditional statistical model. Fast and interpretable, suitable for
                            standard risk assessment with good explainability.
                          </p>
                          <div className="mt-2 flex gap-2 text-xs">
                            <span className="rounded-md bg-blue-100 px-2 py-1 text-blue-700">Default</span>
                            <span className="rounded-md bg-green-100 px-2 py-1 text-green-700">High Interpretability</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                        <RadioGroupItem value="lightgbm" id="lightgbm" className="mt-1" />
                        <div className="flex-1 space-y-1">
                          <Label htmlFor="lightgbm" className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">LightGBM</span>
                              {settings?.active_model === 'lightgbm' && (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Advanced gradient boosting model. Higher accuracy for complex patterns,
                            but requires more computational resources.
                          </p>
                          <div className="mt-2 flex gap-2 text-xs">
                            <span className="rounded-md bg-purple-100 px-2 py-1 text-purple-700">Advanced</span>
                            <span className="rounded-md bg-orange-100 px-2 py-1 text-orange-700">High Accuracy</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  {settings && (
                    <>
                      <Separator />
                      <div className="rounded-lg bg-muted p-4 text-sm">
                        <div className="grid gap-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Model:</span>
                            <span className="font-medium">
                              {settings.active_model === 'logistic' ? 'Logistic Regression' : 'LightGBM'}
                            </span>
                          </div>
                          {settings.model_version && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Version:</span>
                              <span className="font-medium">{settings.model_version}</span>
                            </div>
                          )}
                          {settings.last_updated && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Last Updated:</span>
                              <span className="font-medium">
                                {new Date(settings.last_updated).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your profile details (read-only)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Organization</Label>
                  <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                    Financial Services Corp
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>API Access Level</Label>
                  <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                    Enterprise
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Deployment Environment</Label>
                  <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                    Production
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Confirm Model Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to switch the risk assessment model to{" "}
              <strong>{selectedModel === 'logistic' ? 'Logistic Regression' : 'LightGBM'}</strong>.
              This will affect all future risk assessments. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelChange} disabled={saving}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveSettings} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Confirm Change
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
