import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, AlertCircle } from "lucide-react";

export default function RiskBands() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Risk Bands</h1>
            <p className="text-muted-foreground">
              Analyze risk distribution across different credit bands
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Band Configuration</CardTitle>
              <CardDescription>
                Define and manage credit risk bands for portfolio segmentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold">Low Risk</h3>
                    <Badge className="bg-green-500">0-30% PD</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Applicants with strong credit history and low probability of default
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold">Medium Risk</h3>
                    <Badge className="bg-yellow-500">30-70% PD</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Applicants requiring additional review and monitoring
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold">High Risk</h3>
                    <Badge className="bg-red-500">70-100% PD</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Applicants with elevated default risk requiring careful evaluation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex h-64 items-center justify-center">
              <div className="text-center text-muted-foreground">
                <PieChart className="mx-auto mb-2 h-12 w-12 opacity-20" />
                <p>Advanced risk band analytics coming soon</p>
                <p className="mt-1 text-sm">Connect to backend API to view real data</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
