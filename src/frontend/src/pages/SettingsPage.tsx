import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetBlockedUsers } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { LogOut, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { clear } = useInternetIdentity();
  const { data: blockedUsers = [], isLoading } = useGetBlockedUsers();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Blocked Users
          </CardTitle>
          <CardDescription>Users you have blocked</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : blockedUsers.length === 0 ? (
            <p className="text-muted-foreground">No blocked users</p>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map((principal) => (
                <div key={principal.toString()} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-mono truncate">{principal.toString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="w-5 h-5" />
            Account
          </CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleLogout} className="w-full">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
