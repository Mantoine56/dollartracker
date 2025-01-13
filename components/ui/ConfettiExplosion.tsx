import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ConfettiPieceProps {
  delay: number;
  angle: number;
  distance: number;
  color: string;
  icon: string;
  size: number;
}

function ConfettiPiece({ delay, angle, distance, color, icon, size }: ConfettiPieceProps) {
  const style = useAnimatedStyle(() => {
    const rad = (angle * Math.PI) / 180;
    return {
      transform: [
        {
          translateX: withSequence(
            withDelay(
              delay,
              withSpring(Math.cos(rad) * distance, {
                damping: 10,
                stiffness: 100,
              })
            )
          ),
        },
        {
          translateY: withSequence(
            withDelay(
              delay,
              withSpring(Math.sin(rad) * distance, {
                damping: 10,
                stiffness: 100,
              })
            )
          ),
        },
        {
          rotate: withSequence(
            withDelay(
              delay,
              withTiming(`${angle + 360}deg`, {
                duration: 1000,
                easing: Easing.linear,
              })
            )
          ),
        },
        {
          scale: withSequence(
            withDelay(delay, withSpring(1.2)),
            withDelay(delay + 500, withSpring(0))
          ),
        },
      ],
      opacity: withSequence(
        withDelay(delay, withTiming(1, { duration: 0 })),
        withDelay(delay + 500, withTiming(0, { duration: 500 }))
      ),
    };
  });

  return (
    <Animated.View style={[styles.confettiPiece, style]}>
      <MaterialCommunityIcons name={icon} size={size} color={color} />
    </Animated.View>
  );
}

const CONFETTI_CONFIG = [
  { icon: 'star', colors: ['#FFD700', '#FFA500'] },
  { icon: 'heart', colors: ['#FF69B4', '#FF1493'] },
  { icon: 'star-four-points', colors: ['#4169E1', '#1E90FF'] },
  { icon: 'circle-small', colors: ['#32CD32', '#00FF00'] },
  { icon: 'square', colors: ['#9370DB', '#8A2BE2'] },
  { icon: 'triangle', colors: ['#FF6347', '#FF4500'] },
];

interface Props {
  count?: number;
}

export function ConfettiExplosion({ count = 20 }: Props) {
  const pieces = Array.from({ length: count }, (_, index) => {
    const configIndex = index % CONFETTI_CONFIG.length;
    const colorIndex = index % 2;
    return {
      id: index,
      angle: (360 / count) * index,
      delay: Math.random() * 500,
      distance: 50 + Math.random() * 50,
      icon: CONFETTI_CONFIG[configIndex].icon,
      color: CONFETTI_CONFIG[configIndex].colors[colorIndex],
      size: 12 + Math.random() * 8,
    };
  });

  return (
    <View style={styles.container}>
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} {...piece} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
  },
});
