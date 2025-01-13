import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rewardsService } from '../services/rewards-service';
import {
  AchievementPath,
  Badge,
  UserBadge,
  Milestone,
} from '../../types/rewards';

// Query keys
const REWARDS_KEYS = {
  all: ['rewards'] as const,
  paths: () => [...REWARDS_KEYS.all, 'paths'] as const,
  badges: () => [...REWARDS_KEYS.all, 'badges'] as const,
  userBadges: (userId: string) =>
    [...REWARDS_KEYS.all, 'userBadges', userId] as const,
  milestones: (userId: string) =>
    [...REWARDS_KEYS.all, 'milestones', userId] as const,
};

// Achievement path hooks
export function useAchievementPaths() {
  return useQuery({
    queryKey: REWARDS_KEYS.paths(),
    queryFn: () => rewardsService.getAchievementPaths(),
  });
}

export function useBadges() {
  return useQuery({
    queryKey: REWARDS_KEYS.badges(),
    queryFn: () => rewardsService.getBadges(),
  });
}

export function useUserBadges(userId: string) {
  return useQuery({
    queryKey: REWARDS_KEYS.userBadges(userId),
    queryFn: () => rewardsService.getUserBadges(userId),
    enabled: !!userId,
  });
}

// Progress tracking hooks
export function useUpdateStreakProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      badgeId,
      streak,
    }: {
      userId: string;
      badgeId: string;
      streak: number;
    }) => rewardsService.updateStreakProgress(userId, badgeId, streak),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: REWARDS_KEYS.userBadges(userId),
      });
    },
  });
}

export function useUpdateCountProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      badgeId,
      progress,
    }: {
      userId: string;
      badgeId: string;
      progress: number;
    }) => rewardsService.updateCountProgress(userId, badgeId, progress),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: REWARDS_KEYS.userBadges(userId),
      });
    },
  });
}

// Badge hooks
export function useAwardBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      badgeId,
    }: {
      userId: string;
      badgeId: string;
    }) => rewardsService.awardBadge(userId, badgeId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: REWARDS_KEYS.userBadges(userId),
      });
    },
  });
}

// Milestone hooks
export function useCreateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      name,
      description,
      metadata,
    }: {
      userId: string;
      name: string;
      description: string;
      metadata?: Record<string, any>;
    }) => rewardsService.createMilestone(userId, name, description, metadata),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: REWARDS_KEYS.milestones(userId),
      });
    },
  });
}

export function useUpdateMilestoneProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      milestoneId,
      metadata,
    }: {
      milestoneId: string;
      metadata: Record<string, any>;
    }) => rewardsService.updateMilestoneProgress(milestoneId, metadata),
    onSuccess: () => {
      // Note: We might want to be more specific about which queries to invalidate
      queryClient.invalidateQueries({
        queryKey: REWARDS_KEYS.all,
      });
    },
  });
}

export function useAchieveMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ milestoneId }: { milestoneId: string }) =>
      rewardsService.achieveMilestone(milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: REWARDS_KEYS.all,
      });
    },
  });
}
