import React, { useEffect } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './Card';
import { timingAnimation, springAnimation } from './utils/animations';

type AchievementLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

type AchievementCardProps = {
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  progress: number;
  level: AchievementLevel;
  currentValue?: number;
  targetValue?: number;
  onPress?: () => void;
};

export const AchievementCard = ({
  title,
  description,
  icon,
  progress,
  level,
  currentValue,
  targetValue,
  onPress,
}: AchievementCardProps) => {
  const theme = useTheme();
  const progressAnimation = React.useRef(new Animated.Value(0)).current;
  const completedScale = React.useRef(new Animated.Value(0)).current;
  const iconRotation = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    timingAnimation(progressAnimation, progress, 1000, false).start();
    
    if (progress >= 1) {
      Animated.sequence([
        springAnimation(completedScale, 1.2),
        springAnimation(completedScale, 1)
      ]).start();
    }

    Animated.loop(
      Animated.sequence([
        timingAnimation(iconRotation, 1, 2000),
        timingAnimation(iconRotation, 0, 2000)
      ])
    ).start();
  }, [progress]);

  const getLevelColor = () => {
    switch (level) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
    }
  };

  const spin = iconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const isCompleted = progress >= 1;

  return (
    <Card onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              backgroundColor: getLevelColor() + '20',
              transform: [{ rotate: spin }]
            },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={getLevelColor()}
          />
        </Animated.View>

        {isCompleted && (
          <Animated.View
            style={[
              styles.completedIcon,
              {
                transform: [{ scale: completedScale }],
              },
            ]}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color={theme.colors.success.main}
            />
          </Animated.View>
        )}
      </View>

      <View style={styles.content}>
        <Text variant="titleMedium" style={styles.title}>
          {title}
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.description, { color: theme.colors.text.secondary }]}
        >
          {description}
        </Text>

        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.colors.grey[200] },
            ]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: getLevelColor(),
                  width: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          {currentValue !== undefined && targetValue !== undefined && (
            <Text
              variant="bodySmall"
              style={[styles.progressText, { color: theme.colors.text.secondary }]}
            >
              {currentValue} / {targetValue}
            </Text>
          )}
        </View>

        <Animated.View
          style={[
            styles.levelBadge,
            {
              backgroundColor: getLevelColor() + '20',
              transform: isCompleted ? [{ scale: completedScale }] : undefined,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="medal"
            size={16}
            color={getLevelColor()}
            style={styles.levelIcon}
          />
          <Text
            variant="bodySmall"
            style={[styles.levelText, { color: getLevelColor() }]}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </Text>
        </Animated.View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  content: {
    gap: 8,
  },
  title: {
    fontWeight: '600',
  },
  description: {
    marginBottom: 4,
  },
  progressContainer: {
    gap: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'right',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  levelIcon: {
    marginRight: 4,
  },
  levelText: {
    fontWeight: '600',
  },
});
