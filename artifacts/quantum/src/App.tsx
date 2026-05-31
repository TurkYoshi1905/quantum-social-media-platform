import { Switch, Route, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, lazy, Suspense } from "react";

const AuthPage = lazy(() => import("@/pages/AuthPage"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const ExplorePage = lazy(() => import("@/pages/ExplorePage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const MessagesPage = lazy(() => import("@/pages/MessagesPage"));
const EmailVerifiedPage = lazy(() => import("@/pages/EmailVerifiedPage"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoggedIn, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isLoggedIn) setLocation("/auth");
  }, [isLoggedIn, loading, setLocation]);

  if (loading) return <PageLoader />;
  if (!isLoggedIn) return null;
  return <Component />;
}

function AuthRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoggedIn, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isLoggedIn) setLocation("/home");
  }, [isLoggedIn, loading, setLocation]);

  if (loading) return <PageLoader />;
  if (isLoggedIn) return null;
  return <Component />;
}

function RootRedirect() {
  const { isLoggedIn, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) setLocation(isLoggedIn ? "/home" : "/auth");
  }, [isLoggedIn, loading, setLocation]);

  return <PageLoader />;
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
