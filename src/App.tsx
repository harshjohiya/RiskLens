import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import SingleApplicant from "./pages/SingleApplicant";
import BatchScoring from "./pages/BatchScoring";
import RiskBands from "./pages/RiskBands";
import ExpectedLoss from "./pages/ExpectedLoss";
import Explainability from "./pages/Explainability";
import History from "./pages/History";
import ApiAccess from "./pages/ApiAccess";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/score" element={<SingleApplicant />} />
          <Route path="/batch" element={<BatchScoring />} />
          <Route path="/risk-bands" element={<RiskBands />} />
          <Route path="/expected-loss" element={<ExpectedLoss />} />
          <Route path="/explainability" element={<Explainability />} />
          <Route path="/history" element={<History />} />
          <Route path="/api-access" element={<ApiAccess />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
