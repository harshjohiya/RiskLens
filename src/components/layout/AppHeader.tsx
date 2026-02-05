import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Activity, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "./AppSidebar";

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const { data: health, isLoading } = useQuery({
    queryKey: ["health"],
    queryFn: () => api.getHealth(),
    refetchInterval: 30000, // Check every 30 seconds
    retry: 1,
  });

  const isHealthy = health?.status === "healthy";

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-4">
        {/* Mobile menu */}
        <div className="flex items-center gap-3 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <AppSidebar />
            </SheetContent>
          </Sheet>
        </div>

        {/* Page title */}
        {title && (
          <h1 className="text-lg font-semibold text-foreground hidden lg:block">
            {title}
          </h1>
        )}

        <div className="flex-1 lg:hidden" />

        {/* Health Status */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
              isLoading
                ? "bg-muted text-muted-foreground"
                : isHealthy
                ? "bg-status-success/10 text-status-success"
                : "bg-status-error/10 text-status-error"
            )}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>
              {isLoading ? "Checking..." : isHealthy ? "API Healthy" : "API Down"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
