# Specification

## Summary
**Goal:** Build a free dating website with authenticated profiles, discovery, matching, messaging, and basic safety features.

**Planned changes:**
- Add Internet Identity sign-in and restrict all dating features to authenticated users (public landing page remains accessible).
- Implement backend persistence and APIs for user profiles (including 18+ validation), discovery with filters, likes/pass, match creation, and non-real-time messaging.
- Add block and report features; ensure blocking excludes users from discovery, matching, and messaging; store reports for later moderation review.
- Build core frontend pages and signed-in navigation: Landing, Onboarding/Create Profile (with terms/18+ consent gating), Edit Profile, Discovery (card/swipe UI), Matches, Messages (inbox + conversation), Settings (sign out, block list).
- Use React Query for all backend calls with loading/error/retry and empty states across profile, discovery, matches, and messaging.
- Implement basic profile photo handling UX (manage 1–5 photo URLs/asset references; reorder; display on discovery cards and profile views).
- Apply a coherent, distinctive visual theme across the UI and include generated static image assets referenced from `frontend/public/assets/generated`.

**User-visible outcome:** Users can sign in with Internet Identity, create and manage a dating profile (18+ and guidelines required), browse and filter discovery cards, like/pass to form matches, message matched users via an inbox and conversation view, and block/report other users; unauthenticated users only see the landing page.
