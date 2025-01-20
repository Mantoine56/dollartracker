import { View, StyleSheet, Animated } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useEffect, useRef } from 'react';
import Svg, { Circle } from 'react-native-svg';

interface BudgetCircleProps {
  amount: number;
  total: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function BudgetCircle({ amount, total }: BudgetCircleProps) {
  const theme = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  // Calculate percentage only if we have a valid total
  const percentage = total > 0 ? Math.min(amount / total, 1) : 0;
  const isOverBudget = total > 0 && amount > total;

  console.log('BudgetCircle Render:', { amount, total, percentage, isOverBudget });

  useEffect(() => {
    if (total > 0) {
      console.log('Animation starting with percentage:', percentage);
      Animated.timing(animatedValue, {
        toValue: percentage,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    }
  }, [percentage, amount, total]);

  const size = 220;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const progressColor = isOverBudget ? theme.colors.error : theme.colors.primary;
  const trackColor = theme.colors.surfaceVariant;

  if (!total) {
    return (
      <View style={styles.container}>
        <View style={styles.circleContainer}>
          <Svg height={size} width={size}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={trackColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          </Svg>
          <View style={styles.textContainer}>
            <Text variant="displayLarge" style={styles.amount}>
              ${amount.toFixed(2)}
            </Text>
            <Text variant="bodyMedium" style={styles.budgetNotSet}>
              Set up your budget
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.circleContainer}>
        <Svg height={size} width={size}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          {/* Progress circle */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
        <View style={styles.textContainer}>
          <Text variant="displayLarge" style={styles.amount}>
            ${amount.toFixed(2)}
          </Text>
          <Text 
            variant="bodyMedium" 
            style={[
              styles.remaining,
              { color: isOverBudget ? theme.colors.error : theme.colors.primary }
            ]}
          >
            {isOverBudget ? 'Over budget' : `Remaining: $${(total - amount).toFixed(2)}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  circleContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  remaining: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  budgetNotSet: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    color: 'gray',
  },
});
