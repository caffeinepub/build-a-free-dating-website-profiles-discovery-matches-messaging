import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSaveProfile } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import type { Gender, UserProfile } from '../backend';
import PhotoManager from '../components/profile/PhotoManager';

export default function OnboardingPage() {
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [interestedIn, setInterestedIn] = useState<Gender | null>(null);
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [confirmed18Plus, setConfirmed18Plus] = useState(false);

  const saveProfile = useSaveProfile();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms || !confirmed18Plus) {
      return;
    }

    const profile: UserProfile = {
      displayName,
      age: BigInt(parseInt(age)),
      gender: gender!,
      interestedIn: interestedIn!,
      location,
      bio,
      interests: interests.split(',').map((i) => i.trim()).filter(Boolean),
      photoUrls,
      createdAt: BigInt(Date.now() * 1000000),
      updatedAt: BigInt(Date.now() * 1000000),
      isActive: true,
      hasAgreedToTerms: true,
    };

    await saveProfile.mutateAsync(profile);
    navigate({ to: '/discovery' });
  };

  const canSubmit =
    displayName &&
    age &&
    parseInt(age) >= 18 &&
    gender &&
    interestedIn &&
    location &&
    bio &&
    agreedToTerms &&
    confirmed18Plus;

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Create Your Profile</CardTitle>
          <CardDescription>Tell us about yourself to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min="18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Must be 18 or older"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
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
              <Label htmlFor="interestedIn">Interested In *</Label>
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
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio *</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
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
                placeholder="e.g., hiking, cooking, music"
              />
            </div>

            <div className="space-y-2">
              <Label>Photos</Label>
              <PhotoManager photoUrls={photoUrls} onChange={setPhotoUrls} />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-start gap-3">
                <Checkbox id="age18" checked={confirmed18Plus} onCheckedChange={(checked) => setConfirmed18Plus(!!checked)} />
                <Label htmlFor="age18" className="text-sm leading-relaxed cursor-pointer">
                  I confirm that I am 18 years of age or older
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(!!checked)} />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  I agree to the community guidelines and terms of service. I will treat others with respect and kindness.
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={!canSubmit || saveProfile.isPending}>
              {saveProfile.isPending ? 'Creating Profile...' : 'Create Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
