import { Animated, Easing } from 'react-native';

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
