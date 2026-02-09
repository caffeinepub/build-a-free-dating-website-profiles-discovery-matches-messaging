import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Profile, Message, Gender } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

// Profile queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Not authenticated');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully!');
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to save profile';
      toast.error(message);
    },
  });
}

// Discovery queries
export function useGetRecommendedProfiles(filters?: {
  ageMin?: number;
  ageMax?: number;
  genderFilter?: Gender;
  interestedInFilter?: Gender;
  interestTags?: string[];
}) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Profile[]>({
    queryKey: ['recommendedProfiles', filters],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecommendedProfiles(
        filters?.ageMin ? BigInt(filters.ageMin) : null,
        filters?.ageMax ? BigInt(filters.ageMax) : null,
        filters?.genderFilter || null,
        filters?.interestedInFilter || null,
        filters?.interestTags || null
      );
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useLikeProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPrincipal: Principal) => {
      if (!actor) throw new Error('Not authenticated');
      await actor.likeProfile(targetPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendedProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to like profile';
      toast.error(message);
    },
  });
}

export function usePassProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPrincipal: Principal) => {
      if (!actor) throw new Error('Not authenticated');
      await actor.passProfile(targetPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendedProfiles'] });
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to pass profile';
      toast.error(message);
    },
  });
}

// Matches queries
export function useGetMatches() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{ sent: Profile[]; received: Profile[]; matches: Profile[] }>({
    queryKey: ['matches'],
    queryFn: async () => {
      if (!actor) return { sent: [], received: [], matches: [] };
      return actor.getMatches();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Messages queries
export function useGetConversation(otherUserId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['conversation', otherUserId],
    queryFn: async () => {
      if (!actor) return [];
      const principal = Principal.fromText(otherUserId);
      return actor.getConversation(principal);
    },
    enabled: !!actor && !actorFetching && !!otherUserId,
    refetchInterval: 3000, // Poll every 3 seconds
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipient, content }: { recipient: Principal; content: string }) => {
      if (!actor) throw new Error('Not authenticated');
      await actor.sendMessage(recipient, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.recipient.toString()] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to send message';
      toast.error(message);
    },
  });
}

export function useMarkConversationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (otherUser: Principal) => {
      if (!actor) throw new Error('Not authenticated');
      await actor.markConversationAsRead(otherUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

// Safety queries
export function useBlockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blocked: Principal) => {
      if (!actor) throw new Error('Not authenticated');
      await actor.blockUser(blocked);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendedProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      toast.success('User blocked successfully');
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to block user';
      toast.error(message);
    },
  });
}

export function useReportUser() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ reportedUser, reason, note }: { reportedUser: Principal; reason: string; note: string }) => {
      if (!actor) throw new Error('Not authenticated');
      await actor.reportUser(reportedUser, reason, note);
    },
    onSuccess: () => {
      toast.success('Report submitted successfully');
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to submit report';
      toast.error(message);
    },
  });
}

export function useGetBlockedUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['blockedUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBlockedUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}
