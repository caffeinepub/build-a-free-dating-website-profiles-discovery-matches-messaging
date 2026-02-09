import { useState } from 'react';
import { useGetRecommendedProfiles, useLikeProfile, usePassProfile, useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MapPin, AlertCircle } from 'lucide-react';
import PhotoCarousel from '../components/profile/PhotoCarousel';
import { Principal } from '@dfinity/principal';
import ReportDialog from '../components/safety/ReportDialog';
import BlockButton from '../components/safety/BlockButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from '@tanstack/react-router';

export default function DiscoveryPage() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: profiles = [], isLoading, error, refetch } = useGetRecommendedProfiles();
  const likeProfile = useLikeProfile();
  const passProfile = usePassProfile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const currentProfile = profiles[currentIndex];

  const handleLike = async () => {
    if (!currentProfile) return;
    await likeProfile.mutateAsync(currentProfile.principal);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePass = async () => {
    if (!currentProfile) return;
    await passProfile.mutateAsync(currentProfile.principal);
    setCurrentIndex((prev) => prev + 1);
  };

  if (!profile?.isActive) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please complete your profile setup to start discovering matches.{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate({ to: '/onboarding' })}>
              Complete Profile
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Finding matches for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8 text-center space-y-4">
        <p className="text-destructive">Failed to load profiles</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  if (!currentProfile || currentIndex >= profiles.length) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8 text-center space-y-4">
        <div className="text-6xl mb-4">💫</div>
        <h2 className="text-2xl font-bold">No More Profiles</h2>
        <p className="text-muted-foreground">Check back later for new matches!</p>
        <Button onClick={() => navigate({ to: '/matches' })}>View Your Matches</Button>
      </div>
    );
  }

  const age = Number(currentProfile.age);
  const genderLabel =
    currentProfile.gender.__kind__ === 'female'
      ? 'Female'
      : currentProfile.gender.__kind__ === 'male'
      ? 'Male'
      : currentProfile.gender.other;

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <PhotoCarousel photos={currentProfile.photoUrls} />
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="text-3xl font-bold">
              {currentProfile.displayName}, {age}
            </h2>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              <span>{currentProfile.location}</span>
              <span>•</span>
              <span>{genderLabel}</span>
            </div>
          </div>

          <p className="text-lg">{currentProfile.bio}</p>

          {currentProfile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentProfile.interests.map((interest, idx) => (
                <Badge key={idx} variant="secondary">
                  {interest}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 h-16 rounded-full border-2"
              onClick={handlePass}
              disabled={passProfile.isPending}
            >
              <X className="w-6 h-6 mr-2" />
              Pass
            </Button>
            <Button
              size="lg"
              className="flex-1 h-16 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
              onClick={handleLike}
              disabled={likeProfile.isPending}
            >
              <Heart className="w-6 h-6 mr-2" />
              Like
            </Button>
          </div>

          <div className="flex gap-2 pt-2">
            <BlockButton userPrincipal={currentProfile.principal} onSuccess={() => setCurrentIndex((prev) => prev + 1)} />
            <ReportDialog userPrincipal={currentProfile.principal} userName={currentProfile.displayName} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
