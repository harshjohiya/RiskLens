import { Settings2, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Model and system configuration
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
              Active scoring model
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 border border-primary/40 bg-primary/5 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-status-success flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-foreground">LightGBM</div>
            <div className="text-sm text-muted-foreground">
              High-performance gradient boosting — active model for all scoring
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
