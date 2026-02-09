import { useGetMatches } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function MessagesInboxPage() {
  const { data, isLoading, error } = useGetMatches();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-destructive">Failed to load messages</p>
      </div>
    );
  }

  const matches = data?.matches || [];

  if (matches.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8 text-center space-y-4">
        <div className="text-6xl mb-4">💬</div>
        <h2 className="text-2xl font-bold">No conversations yet</h2>
        <p className="text-muted-foreground">Match with someone to start chatting!</p>
        <Button onClick={() => navigate({ to: '/discovery' })}>Find Matches</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <div className="space-y-2">
        {matches.map((profile) => {
          const age = Number(profile.age);
          const unreadCount = Number(profile.unreadMessagesCount);

          return (
            <Card
              key={profile.principal.toString()}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate({ to: '/conversation/$userId', params: { userId: profile.principal.toString() } })}
            >
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-purple-400 flex-shrink-0 overflow-hidden">
                    {profile.photoUrls[0] ? (
                      <img src={profile.photoUrls[0]} alt={profile.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                        {profile.displayName[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">
                        {profile.displayName}, {age}
                      </h3>
                      {unreadCount > 0 && <Badge variant="default">{unreadCount} new</Badge>}
                    </div>
                    {profile.lastMessagePreview ? (
                      <p className="text-sm text-muted-foreground truncate">{profile.lastMessagePreview}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No messages yet</p>
                    )}
                  </div>
                  <MessageCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
