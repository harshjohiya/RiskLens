import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import type { FutureConfig } from "react-router-dom";

// Pages
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

// App Layout & Pages
import { AppLayout } from "./components/layout/AppLayout";
import DashboardPage from "./pages/app/DashboardPage";
import ScoringPage from "./pages/app/ScoringPage";
import BatchScoringPage from "./pages/app/BatchScoringPage";
import HistoryPage from "./pages/app/HistoryPage";
import ExplainPage from "./pages/app/ExplainPage";
import SettingsPage from "./pages/app/SettingsPage";
import ApiDocsPage from "./pages/app/ApiDocsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        } as FutureConfig}
      >
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* App Routes with Sidebar Layout */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="scoring" element={<ScoringPage />} />
            <Route path="batch" element={<BatchScoringPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="explain" element={<ExplainPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="docs" element={<ApiDocsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
