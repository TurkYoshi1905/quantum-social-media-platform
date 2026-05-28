import { Switch, Route, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import AuthPage from "@/pages/AuthPage";
import HomePage from "@/pages/HomePage";
import ProfilePage from "@/pages/ProfilePage";
import ExplorePage from "@/pages/ExplorePage";
import NotificationsPage from "@/pages/NotificationsPage";
import MessagesPage from "@/pages/MessagesPage";
import EmailVerifiedPage from "@/pages/EmailVerifiedPage";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoggedIn, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isLoggedIn) setLocation("/auth");
  }, [isLoggedIn, loading, setLocation]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
  if (!isLoggedIn) return null;
  return <Component />;
}

function AuthRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoggedIn, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isLoggedIn) setLocation("/home");
  }, [isLoggedIn, loading, setLocation]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
  if (isLoggedIn) return null;
  return <Component />;
}

function RootRedirect() {
  const { isLoggedIn, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) setLocation(isLoggedIn ? "/home" : "/auth");
  }, [isLoggedIn, loading, setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      <Route path="/auth">{() => <AuthRoute component={AuthPage} />}</Route>
      <Route path="/auth/verified" component={EmailVerifiedPage} />
      <Route path="/home">{() => <ProtectedRoute component={HomePage} />}</Route>
      <Route path="/profile">{() => <ProtectedRoute component={ProfilePage} />}</Route>
      <Route path="/explore">{() => <ProtectedRoute component={ExplorePage} />}</Route>
      <Route path="/notifications">{() => <ProtectedRoute component={NotificationsPage} />}</Route>
      <Route path="/messages">{() => <ProtectedRoute component={MessagesPage} />}</Route>
      <Route component={RootRedirect} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
