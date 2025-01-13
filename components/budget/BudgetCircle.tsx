import { View, StyleSheet, Animated } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useEffect, useState, useRef } from 'react';
import Svg, { Circle } from 'react-native-svg';

interface BudgetCircleProps {
  amount: number;
  total: number;
}

export function BudgetCircle({ amount, total }: BudgetCircleProps) {
  const theme = useTheme();
  const [progressAnimation] = useState(new Animated.Value(0));
  const [hasInitialized, setHasInitialized] = useState(false);
  const percentage = total > 0 ? Math.min(amount / total, 1) : 0;
  const isOverBudget = amount > total;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // Only start animation if we have valid data
    if (total > 0 && !hasInitialized) {
      setHasInitialized(true);
    }

    // Cancel any existing animation
    if (animationRef.current) {
      animationRef.current.stop();
    }

    // Create new animation
    animationRef.current = Animated.timing(progressAnimation, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: true,
    });

    // Start the animation if we have valid data
    if (hasInitialized) {
      animationRef.current.start();
    }

    // Cleanup
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [percentage, amount, total, hasInitialized]);

  const getStatusColors = () => {
    return isOverBudget
      ? theme.colors.error
      : theme.colors.primary;
  };

  const size = 220;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  const strokeDashoffset = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.circle, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.innerCircle, { backgroundColor: theme.colors.background }]}>
          <Text 
            variant="displayLarge" 
            style={[styles.amount, { color: theme.colors.onSurface }]}
          >
            ${amount.toFixed(2)}
          </Text>
          <Text 
            variant="bodyMedium" 
            style={[
              styles.remaining, 
              { color: isOverBudget ? theme.colors.error : theme.colors.primary }
            ]}
          >
            Remaining: ${(total - amount).toFixed(2)}
          </Text>
        </View>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={getStatusColors()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  circle: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  innerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  remaining: {
    fontSize: 14,
    textAlign: 'center',
  },
});
