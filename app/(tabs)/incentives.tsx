import React from 'react';
import { View, ScrollView } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AchievementCard } from '../../components/ui/AchievementCard';
import { useAchievementProgress } from '../../lib/hooks/use-achievement-progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export default function IncentivesScreen() {
  const theme = useTheme();
  const { progress, isLoading: progressLoading } = useAchievementProgress();

  // Fetch badges for each path
  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select(`
          *,
          user_badges (*)
        `);

      if (error) {
        console.error('Error fetching badges:', error);
        return [];
      }

      return data || [];
    },
  });

  const isLoading = progressLoading || badgesLoading;

  if (isLoading) {
    return (
      <SafeAreaView edges={['right', 'left']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['right', 'left']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView>
        {progress?.map(path => {
          // Get badges for this path
          const pathBadges = badges
            ?.filter(b => b.path_id === path.pathId)
            .map(badge => ({
              name: badge.name,
              description: badge.description,
              level: badge.level,
              icon: badge.icon,
              progress: badge.user_badges?.[0]?.progress || 0,
            }));

          return (
            <AchievementCard
              key={path.pathId}
              title={path.pathName}
              description={path.description}
              icon={path.icon}
              progress={path.progress}
              badges={pathBadges}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
