import { supabase } from '../supabase';
import {
  AchievementPath,
  Badge,
  UserBadge,
  Milestone,
  BadgeLevel,
} from '../../types/rewards';

class RewardsService {
  // Achievement Paths Management
  async getAchievementPaths(): Promise<AchievementPath[]> {
    const { data, error } = await supabase
      .from('achievement_paths')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getBadges(): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('level', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*, badge:badges(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  // Progress Tracking
  async updateStreakProgress(
    userId: string,
    badgeId: string,
    streak: number
  ): Promise<void> {
    const { error } = await supabase
      .from('user_badges')
      .upsert({
        user_id: userId,
        badge_id: badgeId,
        current_streak: streak,
        longest_streak: streak, // This should be max(current_streak, longest_streak)
        last_tracked_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  async updateCountProgress(
    userId: string,
    badgeId: string,
    progress: number
  ): Promise<void> {
    const { error } = await supabase
      .from('user_badges')
      .upsert({
        user_id: userId,
        badge_id: badgeId,
        progress: progress,
        last_tracked_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  // Badge Management
  async awardBadge(userId: string, badgeId: string): Promise<void> {
    const { error } = await supabase
      .from('user_badges')
      .update({
        achieved_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('badge_id', badgeId);

    if (error) throw error;
  }

  // Milestone Management
  async createMilestone(
    userId: string,
    name: string,
    description: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const { error } = await supabase.from('milestones').insert({
      user_id: userId,
      name,
      description,
      metadata,
    });

    if (error) throw error;
  }

  async updateMilestoneProgress(
    milestoneId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase
      .from('milestones')
      .update({ metadata })
      .eq('id', milestoneId);

    if (error) throw error;
  }

  async achieveMilestone(milestoneId: string): Promise<void> {
    const { error } = await supabase
      .from('milestones')
      .update({
        achieved_at: new Date().toISOString(),
      })
      .eq('id', milestoneId);

    if (error) throw error;
  }
}

export const rewardsService = new RewardsService();
