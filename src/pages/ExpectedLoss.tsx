import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function ExpectedLoss() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expected Loss Analysis</h1>
            <p className="text-muted-foreground">
              Monitor and forecast potential credit losses across your portfolio
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Expected Loss</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Connect API</div>
                <p className="text-xs text-muted-foreground">Aggregate portfolio loss</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Loss Given Default (LGD)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Connect API</div>
                <p className="text-xs text-muted-foreground">Average recovery rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Exposure at Default (EAD)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Connect API</div>
                <p className="text-xs text-muted-foreground">Total credit exposure</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Expected Loss Formula</CardTitle>
              <CardDescription>
                Understanding the components of credit risk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted p-6 text-center">
                <div className="mb-4 text-2xl font-bold">
                  EL = PD × LGD × EAD
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>PD</strong> = Probability of Default (from risk model)</p>
                  <p><strong>LGD</strong> = Loss Given Default (1 - Recovery Rate)</p>
                  <p><strong>EAD</strong> = Exposure at Default (loan amount)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex h-64 items-center justify-center">
              <div className="text-center text-muted-foreground">
                <DollarSign className="mx-auto mb-2 h-12 w-12 opacity-20" />
                <p>Connect to backend API to view expected loss metrics</p>
                <p className="mt-1 text-sm">Real-time portfolio loss calculations</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
