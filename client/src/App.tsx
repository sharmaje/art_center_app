import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import Pending from "./pages/Pending";
import Rejected from "./pages/Rejected";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./_core/hooks/useAuth";

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen blueprint-grid flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-2 border-[#1e90ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-white text-sm tracking-widest">INITIALIZING SYSTEM...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // For now, show dashboard for all authenticated users
  // The access control will be enforced at the procedure level
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
