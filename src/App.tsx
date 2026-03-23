import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import RoutePlanning from "./pages/RoutePlanning";
import SafetyAnalysis from "./pages/SafetyAnalysis";
import LiveNavigation from "./pages/LiveNavigation";
import GuardianMode from "./pages/GuardianMode";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<RoutePlanning />} />
            <Route path="/safety" element={<SafetyAnalysis />} />
            <Route path="/navigate" element={<LiveNavigation />} />
            <Route path="/guardian" element={<GuardianMode />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
