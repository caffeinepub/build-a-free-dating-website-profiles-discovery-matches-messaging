import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetCallerUserProfile, useSaveProfile } from '../hooks/useQueries';
import type { Gender, UserProfile } from '../backend';
import PhotoManager from '../components/profile/PhotoManager';

export default function EditProfilePage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveProfile();

  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [interestedIn, setInterestedIn] = useState<Gender | null>(null);
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setAge(profile.age.toString());
      setGender(profile.gender);
      setInterestedIn(profile.interestedIn);
      setLocation(profile.location);
      setBio(profile.bio);
      setInterests(profile.interests.join(', '));
      setPhotoUrls(profile.photoUrls);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: UserProfile = {
      displayName,
      age: BigInt(parseInt(age)),
      gender: gender!,
      interestedIn: interestedIn!,
      location,
      bio,
      interests: interests.split(',').map((i) => i.trim()).filter(Boolean),
      photoUrls,
      createdAt: profile?.createdAt || BigInt(Date.now() * 1000000),
      updatedAt: BigInt(Date.now() * 1000000),
      isActive: profile?.isActive || true,
      hasAgreedToTerms: profile?.hasAgreedToTerms || true,
    };

    await saveProfile.mutateAsync(updatedProfile);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Edit Profile</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={gender ? (gender.__kind__ === 'female' ? 'female' : gender.__kind__ === 'male' ? 'male' : 'other') : ''}
                onValueChange={(value) => {
                  if (value === 'female') setGender({ __kind__: 'female', female: null });
                  else if (value === 'male') setGender({ __kind__: 'male', male: null });
                  else setGender({ __kind__: 'other', other: 'Other' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestedIn">Interested In</Label>
              <Select
                value={
                  interestedIn
                    ? interestedIn.__kind__ === 'female'
                      ? 'female'
                      : interestedIn.__kind__ === 'male'
                      ? 'male'
                      : 'other'
                    : ''
                }
                onValueChange={(value) => {
                  if (value === 'female') setInterestedIn({ __kind__: 'female', female: null });
                  else if (value === 'male') setInterestedIn({ __kind__: 'male', male: null });
                  else setInterestedIn({ __kind__: 'other', other: 'Other' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Who are you looking for?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Women</SelectItem>
                  <SelectItem value="male">Men</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interests (comma-separated)</Label>
              <Input
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Photos</Label>
              <PhotoManager photoUrls={photoUrls} onChange={setPhotoUrls} />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={saveProfile.isPending}>
              {saveProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
