import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import DiscoveryPage from './pages/DiscoveryPage';
import MatchesPage from './pages/MatchesPage';
import MessagesInboxPage from './pages/MessagesInboxPage';
import ConversationPage from './pages/ConversationPage';
import EditProfilePage from './pages/EditProfilePage';
import SettingsPage from './pages/SettingsPage';
import AuthedShell from './components/layout/AuthedShell';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  if (isInitializing || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    window.location.href = '/';
    return null;
  }

  const needsOnboarding = isFetched && profile === null;
  if (needsOnboarding && window.location.hash !== '#/onboarding') {
    window.location.href = '#/onboarding';
    return null;
  }

  return <>{children}</>;
}

function Layout() {
  return (
    <AuthGuard>
      <AuthedShell>
        <Outlet />
      </AuthedShell>
    </AuthGuard>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Outlet />
      <Toaster />
    </ThemeProvider>
  ),
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const authedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authed',
  component: Layout,
});

const onboardingRoute = createRoute({
  getParentRoute: () => authedRoute,
  path: '/onboarding',
  component: OnboardingPage,
});

const discoveryRoute = createRoute({
  getParentRoute: () => authedRoute,
  path: '/discovery',
  component: DiscoveryPage,
});

const matchesRoute = createRoute({
  getParentRoute: () => authedRoute,
  path: '/matches',
  component: MatchesPage,
});

const messagesRoute = createRoute({
  getParentRoute: () => authedRoute,
  path: '/messages',
  component: MessagesInboxPage,
});

const conversationRoute = createRoute({
  getParentRoute: () => authedRoute,
  path: '/conversation/$userId',
  component: ConversationPage,
});

const profileRoute = createRoute({
  getParentRoute: () => authedRoute,
  path: '/profile',
  component: EditProfilePage,
});

const settingsRoute = createRoute({
  getParentRoute: () => authedRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  authedRoute.addChildren([
    onboardingRoute,
    discoveryRoute,
    matchesRoute,
    messagesRoute,
    conversationRoute,
    profileRoute,
    settingsRoute,
  ]),
]);

const router = createRouter({ routeTree, defaultPreload: 'intent' });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
