import React, { useEffect } from 'react';
import { StyleSheet, View, Animated, ViewStyle } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';

type CircularProgressProps = {
  size?: number;
  strokeWidth?: number;
  progress: number;
  showValue?: boolean;
  label?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
};

export const CircularProgress = ({
  size = 200,
  strokeWidth = 12,
  progress,
  showValue = false,
  label,
  style,
  children,
}: CircularProgressProps) => {
  const theme = useTheme();
  const animatedProgress = React.useRef(new Animated.Value(0)).current;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const animatedStrokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const getProgressColor = () => {
    if (progress >= 75) return theme.colors.error.main;
    if (progress >= 50) return theme.colors.warning.main;
    return theme.colors.success.main;
  };

  return (
    <Surface style={[styles.container, { width: size, height: size }, style]} elevation={2}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={theme.colors.grey[200]}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Animated.Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={getProgressColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={animatedStrokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      
      <View style={styles.content}>
        {showValue && (
          <Animated.Text
            style={[
              styles.progressText,
              {
                fontSize: size * 0.1,
                color: theme.colors.text.primary,
              },
            ]}
          >
            {animatedProgress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', `${Math.round(progress)}%`],
            })}
          </Animated.Text>
        )}
        {label && (
          <Text variant="titleMedium" style={[styles.label, { color: theme.colors.text.secondary }]}>
            {label}
          </Text>
        )}
        {children}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  svg: {
    position: 'absolute',
    transform: [{ rotate: '-90deg' }],
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontWeight: 'bold',
  },
  label: {
    marginTop: 4,
    textAlign: 'center',
  },
});
