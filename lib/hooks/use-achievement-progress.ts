import { useCallback } from 'react';
import { useSupabase } from './use-supabase';
import { useAuth } from '../../context/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { startOfDay, endOfDay, subDays } from 'date-fns';

interface Badge {
  id: string;
  path_id: string;
  name: string;
  description: string;
  level: 'bronze' | 'silver' | 'gold';
  icon: string;
  criteria: {
    type: 'streak' | 'count';
    days?: number;
    target?: number;
    percentage?: number;
  };
}

interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  progress: number;
  current_streak: number;
  longest_streak: number;
  achieved_at: string | null;
}

interface AchievementProgress {
  pathId: string;
  pathName: string;
  icon: string;
  description: string;
  progress: number;
  currentStreak: number;
}

async function calculateBadgeProgress(
  userId: string,
  badge: Badge,
  currentDate = new Date()
): Promise<{ progress: number; currentStreak: number }> {
  console.log(`Calculating progress for badge: ${badge.name}`);
  const { criteria } = badge;

  // Get relevant transactions based on badge type
  const startDate = subDays(currentDate, criteria.days || 30);
  console.log(`Fetching transactions from ${startDate.toISOString()} to ${currentDate.toISOString()}`);
  
  const { data: transactions, error } = await supabase
    .from('daily_transactions')
    .select(`
      *,
      category:categories!daily_transactions_category_id_fkey (*)
    `)
    .eq('user_id', userId)
    .gte('transaction_time', startDate.toISOString())
    .lte('transaction_time', currentDate.toISOString())
    .order('transaction_time', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return { progress: 0, currentStreak: 0 };
  }

  console.log(`Found ${transactions?.length || 0} transactions`);

  // Get budget information if needed
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .single();

  const monthlyBudget = budgets?.spending_budget || 0;
  console.log(`Monthly budget: ${monthlyBudget}`);

  switch (badge.name.toLowerCase()) {
    case 'budget beginner':
    case 'budget pro':
    case 'budget master': {
      // Calculate daily spending vs budget
      const dailyBudget = monthlyBudget / 30;
      console.log(`Daily budget target: ${dailyBudget}`);
      let currentStreak = 0;

      // Group transactions by date
      const dailySpending = transactions.reduce((acc, t) => {
        const date = startOfDay(new Date(t.transaction_time)).toISOString();
        acc[date] = (acc[date] || 0) + t.amount;
        return acc;
      }, {});

      console.log('Daily spending:', dailySpending);

      // Calculate streak
      for (let i = 0; i < (criteria.days || 0); i++) {
        const date = startOfDay(subDays(currentDate, i)).toISOString();
        const spent = dailySpending[date] || 0;
        
        if (spent <= dailyBudget) {
          currentStreak++;
          console.log(`Day ${i}: Under budget (${spent} <= ${dailyBudget})`);
        } else {
          console.log(`Day ${i}: Over budget (${spent} > ${dailyBudget})`);
          break;
        }
      }

      const progress = Math.min(1, currentStreak / (criteria.days || 1));
      console.log(`Budget progress: ${progress * 100}%, streak: ${currentStreak} days`);
      return { progress, currentStreak };
    }

    case 'savings starter':
    case 'savings pro':
    case 'savings guru': {
      // Calculate monthly savings
      const targetPercentage = criteria.percentage || 5;
      const targetAmount = (monthlyBudget * targetPercentage) / 100;
      console.log(`Monthly savings target: ${targetAmount} (${targetPercentage}% of ${monthlyBudget})`);
      let successfulMonths = 0;

      // Group transactions by month
      const monthlySpending = transactions.reduce((acc, t) => {
        const month = new Date(t.transaction_time).toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + t.amount;
        return acc;
      }, {});

      console.log('Monthly spending:', monthlySpending);

      // Count months where savings target was met
      Object.entries(monthlySpending).forEach(([month, spent]) => {
        const saved = monthlyBudget - spent;
        if (saved >= targetAmount) {
          successfulMonths++;
          console.log(`${month}: Savings goal met (saved ${saved} >= ${targetAmount})`);
        } else {
          console.log(`${month}: Savings goal missed (saved ${saved} < ${targetAmount})`);
        }
      });

      const progress = Math.min(1, successfulMonths / (criteria.target || 1));
      console.log(`Savings progress: ${progress * 100}%, successful months: ${successfulMonths}`);
      return { progress, currentStreak: successfulMonths };
    }

    case 'tracking initiate':
    case 'tracking veteran':
    case 'tracking master': {
      // Calculate daily tracking streak
      let currentStreak = 0;

      // Group transactions by date
      const daysWithTransactions = new Set(
        transactions.map(t => 
          startOfDay(new Date(t.transaction_time)).toISOString()
        )
      );

      console.log('Days with transactions:', Array.from(daysWithTransactions));

      // Calculate streak
      for (let i = 0; i < (criteria.days || 0); i++) {
        const date = startOfDay(subDays(currentDate, i)).toISOString();
        if (daysWithTransactions.has(date)) {
          currentStreak++;
          console.log(`Day ${i}: Transaction logged`);
        } else {
          console.log(`Day ${i}: No transactions`);
          break;
        }
      }

      const progress = Math.min(1, currentStreak / (criteria.days || 1));
      console.log(`Tracking progress: ${progress * 100}%, streak: ${currentStreak} days`);
      return { progress, currentStreak };
    }

    default:
      console.log(`Unknown badge type: ${badge.name}`);
      return { progress: 0, currentStreak: 0 };
  }
}

export function useAchievementProgress() {
  const { user } = useAuth();

  console.log('useAchievementProgress - Current user:', user?.id);

  // First, ensure user has badge entries
  const ensureUserBadges = async () => {
    if (!user?.id) {
      console.log('ensureUserBadges - No user ID');
      return;
    }

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('ensureUserBadges - Session error:', sessionError);
      // Try to refresh the session
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !refreshedSession) {
        console.error('ensureUserBadges - Failed to refresh session:', refreshError);
        return;
      }
    }

    console.log('ensureUserBadges - Fetching badges');
    // Get all badges
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*');

    if (badgesError) {
      console.error('ensureUserBadges - Error fetching badges:', badgesError);
      return;
    }

    if (!badges?.length) {
      console.log('ensureUserBadges - No badges found');
      return;
    }

    console.log('ensureUserBadges - Found badges:', badges.length);

    // Get user's existing badges
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id);

    if (userBadgesError) {
      console.error('ensureUserBadges - Error fetching user badges:', userBadgesError);
      return;
    }

    // Create missing user badges
    const existingBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);
    const missingBadges = badges.filter(b => !existingBadgeIds.has(b.id));

    if (missingBadges.length > 0) {
      console.log('ensureUserBadges - Creating missing user badges:', missingBadges.length);
      const userBadgeInserts = missingBadges.map(badge => ({
        user_id: user.id,
        badge_id: badge.id,
        progress: 0,
        current_streak: 0,
        longest_streak: 0,
      }));

      const { error: insertError } = await supabase
        .from('user_badges')
        .insert(userBadgeInserts)
        .select();

      if (insertError) {
        console.error('ensureUserBadges - Error inserting user badges:', insertError);
      } else {
        console.log('ensureUserBadges - Successfully created missing user badges');
      }
    } else {
      console.log('ensureUserBadges - All badges exist for user');
    }
  };

  // Fetch current progress
  const { data: progress, isLoading, error } = useQuery({
    queryKey: ['achievement-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('queryFn - No user ID');
        throw new Error('User not authenticated');
      }

      console.log('queryFn - Starting achievement progress fetch');

      // Ensure user has badge entries
      await ensureUserBadges();

      console.log('queryFn - Fetching achievement paths and badges');
      // Get all achievement paths with their badges
      const { data: paths, error: pathsError } = await supabase
        .from('achievement_paths')
        .select(`
          *,
          badges (*)
        `);

      if (pathsError) {
        console.error('queryFn - Error fetching paths:', pathsError);
        throw pathsError;
      }

      if (!paths?.length) {
        console.log('queryFn - No achievement paths found');
        return [];
      }

      console.log('queryFn - Found paths:', paths.length);

      // Calculate progress for each badge
      const progressPromises = paths.map(async path => {
        const pathBadges = path.badges || [];
        const badgeProgressPromises = pathBadges.map(badge => 
          calculateBadgeProgress(user.id, badge)
        );
        const badgeProgresses = await Promise.all(badgeProgressPromises);

        // Update user_badges table with new progress
        const updatePromises = pathBadges.map(async (badge, index) => {
          const progress = badgeProgresses[index];
          await supabase
            .from('user_badges')
            .update({
              progress: progress.progress,
              current_streak: progress.currentStreak,
              longest_streak: Math.max(progress.currentStreak, 0), // Update if current streak is longer
            })
            .eq('user_id', user.id)
            .eq('badge_id', badge.id);
        });

        await Promise.all(updatePromises);

        // Calculate overall path progress
        const badgeWeights = { bronze: 1, silver: 2, gold: 3 };
        const totalWeight = pathBadges.reduce((sum, b) => sum + badgeWeights[b.level], 0);
        const currentProgress = badgeProgresses.reduce((sum, progress, index) => {
          const badge = pathBadges[index];
          return sum + (progress.progress * badgeWeights[badge.level]);
        }, 0);

        return {
          pathId: path.id,
          pathName: path.name,
          icon: path.icon,
          description: path.description,
          progress: totalWeight > 0 ? Math.min(1, currentProgress / totalWeight) : 0,
          currentStreak: Math.max(...badgeProgresses.map(p => p.currentStreak), 0),
        };
      });

      const progressData = await Promise.all(progressPromises);
      console.log('queryFn - Calculated progress:', progressData);
      return progressData;
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    progress,
    isLoading,
    error,
  };
}
