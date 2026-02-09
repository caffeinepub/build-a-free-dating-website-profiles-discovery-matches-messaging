import { useGetMatches } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Heart } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { Profile } from '../backend';

export default function MatchesPage() {
  const { data, isLoading, error } = useGetMatches();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-destructive">Failed to load matches</p>
      </div>
    );
  }

  const matches = data?.matches || [];
  const sent = data?.sent || [];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Matches</h1>

      <Tabs defaultValue="matches">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="matches">
            Matches ({matches.length})
          </TabsTrigger>
          <TabsTrigger value="likes">
            Likes Sent ({sent.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-4">
          {matches.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="text-6xl mb-4">💕</div>
              <h3 className="text-xl font-semibold">No matches yet</h3>
              <p className="text-muted-foreground">Keep swiping to find your perfect match!</p>
              <Button onClick={() => navigate({ to: '/discovery' })}>Start Discovering</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {matches.map((profile) => (
                <MatchCard key={profile.principal.toString()} profile={profile} navigate={navigate} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="likes" className="space-y-4">
          {sent.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="text-6xl mb-4">❤️</div>
              <h3 className="text-xl font-semibold">No likes sent yet</h3>
              <p className="text-muted-foreground">Start liking profiles to see them here!</p>
              <Button onClick={() => navigate({ to: '/discovery' })}>Start Discovering</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {sent.map((profile) => (
                <ProfileCard key={profile.principal.toString()} profile={profile} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MatchCard({ profile, navigate }: { profile: Profile; navigate: any }) {
  const age = Number(profile.age);
  const unreadCount = Number(profile.unreadMessagesCount);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-purple-400 flex-shrink-0 overflow-hidden">
            {profile.photoUrls[0] ? (
              <img src={profile.photoUrls[0]} alt={profile.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                {profile.displayName[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {profile.displayName}, {age}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{profile.location}</p>
            {profile.lastMessagePreview && (
              <p className="text-sm text-muted-foreground truncate mt-1">{profile.lastMessagePreview}</p>
            )}
            <Button
              size="sm"
              className="mt-2"
              onClick={() => navigate({ to: '/conversation/$userId', params: { userId: profile.principal.toString() } })}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Message
              {unreadCount > 0 && <Badge className="ml-2">{unreadCount}</Badge>}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileCard({ profile }: { profile: Profile }) {
  const age = Number(profile.age);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-purple-400 flex-shrink-0 overflow-hidden">
            {profile.photoUrls[0] ? (
              <img src={profile.photoUrls[0]} alt={profile.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                {profile.displayName[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {profile.displayName}, {age}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{profile.location}</p>
            <div className="flex items-center gap-1 mt-2 text-rose-500">
              <Heart className="w-4 h-4 fill-current" />
              <span className="text-sm">Liked</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
