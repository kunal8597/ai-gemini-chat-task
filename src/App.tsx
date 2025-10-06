import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "./components/auth/LoginForm";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";
import { useAuthStore } from "./stores/authStore";
import { BackgroundGradient } from "@/components/ui/bg-gradient";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const App = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen overflow-hidden relative">
            <BackgroundGradient
              className="dark:opacity-85"
              gradientFrom="hsl(var(--gradient-start))"
              gradientTo="hsl(var(--gradient-end))"
            />
            {/* Main content container with glass effect */}
            <div className="">
              <main className="rounded-xl ">
                <Routes>
                  <Route
                    path="/"
                    element={
                      isAuthenticated ? <Navigate to="/dashboard" /> : <LoginForm />
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <ChatPage />
                      </ProtectedRoute>
                    }
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
