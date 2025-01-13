import { Animated, Easing } from 'react-native';
import { withSpring, withSequence, withTiming, withDelay } from 'react-native-reanimated';
import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

export const springAnimation = (
  value: Animated.Value,
  toValue: number,
  useNativeDriver = true
) => {
  return Animated.spring(value, {
    toValue,
    useNativeDriver,
    damping: 10,
    mass: 1,
    stiffness: 100,
  });
};

export const timingAnimation = (
  value: Animated.Value,
  toValue: number,
  duration = 300,
  useNativeDriver = true
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    useNativeDriver,
  });
};

export const pressAnimation = (scale: Animated.Value) => {
  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      damping: 10,
      mass: 1,
      stiffness: 100,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 10,
      mass: 1,
      stiffness: 100,
    }).start();
  };

  return { onPressIn, onPressOut };
};

const springConfig: WithSpringConfig = {
  damping: 10,
  mass: 1,
  stiffness: 100,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 2,
};

const timingConfig: WithTimingConfig = {
  duration: 500,
};

export const achievementUnlockAnimation = {
  transform: [
    { translateY: withSpring(-10, { damping: 5, stiffness: 100 }) },
    { scale: withSpring(1, { damping: 5, stiffness: 100 }) }
  ],
  opacity: withTiming(1, { duration: 500 })
};

export const badgeShineAnimation = {
  transform: [
    { translateX: withSequence(
      withTiming(-60, { duration: 0 }),
      withTiming(60, { duration: 1000 })
    ) }
  ],
  opacity: withTiming(0.6, { duration: 1000 })
};

export const confettiAnimation = {
  transform: [
    { translateY: withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(-20, { duration: 1000 })
    ) },
    { scale: withSpring(1.2, { damping: 5, stiffness: 100 }) }
  ],
  opacity: withTiming(0, { duration: 1000 })
};
