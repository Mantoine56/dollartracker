import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Text, Surface, useTheme, ProgressBar, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Carousel from 'react-native-reanimated-carousel';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AchievementUnlock } from './AchievementUnlock';

interface Badge {
  name: string;
  description: string;
  level: 'bronze' | 'silver' | 'gold';
  icon: string;
  progress: number;
}

interface AchievementCardProps {
  title: string;
  description: string;
  icon: string;
  progress: number;
  badges?: Badge[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32; // 16px padding on each side

export function AchievementCard({
  title,
  description,
  icon,
  progress = 0,
  badges = [],
}: AchievementCardProps) {
  const theme = useTheme();
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    // Check if any badge just reached 100%
    const newlyUnlocked = badges.find(badge => 
      Math.abs(badge.progress - 1) < 0.001 && 
      badge.progress > 0
    );
    
    if (newlyUnlocked) {
      setUnlockedBadge(newlyUnlocked);
    }
  }, [badges]);

  const handleAnimationComplete = useCallback(() => {
    setUnlockedBadge(null);
  }, []);

  const testUnlockAnimation = useCallback((badge: Badge) => {
    if (!unlockedBadge) { // Prevent multiple animations at once
      setUnlockedBadge(badge);
    }
  }, [unlockedBadge]);

  const renderBadge = ({ item: badge }: { item: Badge }) => (
    <Surface
      style={[
        styles.badgeContainer,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
      elevation={0}
    >
      <View style={styles.badgeHeader}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <MaterialCommunityIcons
            name={badge.icon as any}
            size={24}
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.badgeInfo}>
          <Text variant="titleMedium" style={styles.badgeTitle}>
            {badge.name}
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {badge.level.charAt(0).toUpperCase() + badge.level.slice(1)}
          </Text>
        </View>
      </View>
      <Text
        variant="bodySmall"
        style={[styles.badgeDescription, { color: theme.colors.onSurfaceVariant }]}
        numberOfLines={2}
      >
        {badge.description}
      </Text>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarWrapper}>
          <ProgressBar
            progress={badge.progress}
            style={[styles.progressBar, { backgroundColor: theme.colors.surfaceDisabled }]}
            color={theme.colors.primary}
          />
        </View>
        <Text variant="bodySmall" style={styles.progressText}>
          {Math.round(badge.progress * 100)}% Complete
        </Text>
      </View>
    </Surface>
  );

  return (
    <Animated.View
      entering={FadeInDown}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {unlockedBadge && (
        <AchievementUnlock
          badgeName={unlockedBadge.name}
          badgeIcon={unlockedBadge.icon}
          level={unlockedBadge.level}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name={icon as any}
          size={24}
          color={theme.colors.primary}
        />
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {description}
          </Text>
        </View>
      </View>

      <Surface
        style={[
          styles.progressContainer,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
        elevation={0}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <MaterialCommunityIcons
            name={icon as any}
            size={24}
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarWrapper}>
            <ProgressBar
              progress={progress}
              style={[styles.progressBar, { backgroundColor: theme.colors.surfaceDisabled }]}
              color={theme.colors.primary}
            />
          </View>
          <Text variant="bodySmall" style={styles.progressText}>
            {Math.round(progress * 100)}% Complete
          </Text>
        </View>
      </Surface>

      {badges.length > 0 && (
        <View style={styles.carouselContainer}>
          <Carousel
            loop={false}
            width={CARD_WIDTH}
            height={140}
            data={badges}
            renderItem={renderBadge}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.9,
              parallaxScrollingOffset: 50,
            }}
            style={styles.carousel}
          />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    paddingVertical: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    textTransform: 'capitalize',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  progressBarContainer: {
    flex: 1,
  },
  progressBarWrapper: {
    height: 8,
    justifyContent: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    marginTop: 4,
    textAlign: 'right',
  },
  carouselContainer: {
    marginTop: 8,
  },
  carousel: {
    width: SCREEN_WIDTH,
  },
  badgeContainer: {
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    height: '100%',
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  badgeTitle: {
    marginBottom: 2,
  },
  badgeDescription: {
    marginBottom: 8,
  },
});
