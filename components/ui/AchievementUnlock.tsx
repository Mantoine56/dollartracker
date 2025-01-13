import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  FadeIn,
  FadeOut,
  SlideInDown,
} from 'react-native-reanimated';
import { ConfettiExplosion } from './ConfettiExplosion';

interface Props {
  badgeName: string;
  badgeIcon: string;
  level: 'bronze' | 'silver' | 'gold';
  onAnimationComplete?: () => void;
}

export function AchievementUnlock({
  badgeName,
  badgeIcon,
  level,
  onAnimationComplete,
}: Props) {
  const theme = useTheme();

  const shineStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSequence(
          withTiming(-60, { duration: 0 }),
          withDelay(500, withTiming(60, { duration: 1000 }))
        ),
      },
    ],
    opacity: withSequence(
      withTiming(0, { duration: 0 }),
      withDelay(500, withTiming(0.8, { duration: 1000 })),
      withTiming(0, { duration: 500 })
    ),
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <Animated.View 
      entering={SlideInDown.springify().damping(15)} 
      exiting={FadeOut}
      style={styles.container}
    >
      <View style={[styles.card, { backgroundColor: theme.colors.elevation.level3 }]}>
        <View style={styles.content}>
          <Animated.View 
            entering={FadeIn.delay(300)}
            style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}
          >
            <MaterialCommunityIcons 
              name={badgeIcon as any} 
              size={32} 
              color={theme.colors.onPrimary} 
            />
            <Animated.View style={[styles.shine, shineStyle]} />
          </Animated.View>
          <Animated.View 
            entering={FadeIn.delay(500)}
            style={styles.textContainer}
          >
            <Text variant="titleMedium">Achievement Unlocked!</Text>
            <Text variant="bodyMedium">{badgeName}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </Animated.View>
        </View>
      </View>
      <ConfettiExplosion count={30} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    width: 20,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ skewX: '-20deg' }],
  },
  textContainer: {
    flex: 1,
  },
});
