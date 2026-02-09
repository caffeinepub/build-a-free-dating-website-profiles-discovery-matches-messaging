import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Heart, MessageCircle, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export default function LandingPage() {
  const { login, identity, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/discovery' });
    }
  }, [identity, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-rose-900/20">
      {/* Header */}
      <header className="border-b border-rose-200/50 dark:border-rose-800/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/generated/dating-logo.dim_512x512.png" alt="Logo" className="w-10 h-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
              HeartLink
            </span>
          </div>
          <Button onClick={login} disabled={isLoggingIn} size="lg" className="rounded-full">
            {isLoggingIn ? 'Connecting...' : 'Sign In'}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Find Your Perfect{' '}
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Match
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Connect with amazing people, build meaningful relationships, and discover love in a safe, welcoming community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button onClick={login} disabled={isLoggingIn} size="lg" className="rounded-full px-8 text-lg h-14">
              {isLoggingIn ? 'Connecting...' : 'Get Started Free'}
            </Button>
          </div>
          <div className="pt-12">
            <img
              src="/assets/generated/dating-hero.dim_1600x900.png"
              alt="Dating Hero"
              className="rounded-3xl shadow-2xl mx-auto max-w-full"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Heart className="w-8 h-8" />}
            title="Smart Matching"
            description="Our algorithm helps you discover compatible profiles based on your interests and preferences."
          />
          <FeatureCard
            icon={<MessageCircle className="w-8 h-8" />}
            title="Easy Messaging"
            description="Chat with your matches in real-time and build meaningful connections."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Safe & Secure"
            description="Your privacy matters. We use blockchain technology to keep your data secure."
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="100% Free"
            description="No hidden fees, no premium tiers. All features are completely free forever."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-rose-200/50 dark:border-rose-800/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} HeartLink. Built with <Heart className="inline w-4 h-4 text-rose-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-purple-500 flex items-center justify-center text-white mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
