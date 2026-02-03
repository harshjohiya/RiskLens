import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          "md:ml-64", // Default desktop margin
          "peer-data-[collapsed=true]/sidebar:md:ml-16" // Collapsed state margin
        )}
      >
        {children}
      </main>
    </div>
  );
}
