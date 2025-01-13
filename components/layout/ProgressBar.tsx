import React from 'react';
import { StyleSheet, View, Animated, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type ProgressBarProps = {
  progress: number;
  height?: number;
  showLabel?: boolean;
  labelPosition?: 'top' | 'right';
  color?: string;
  style?: ViewStyle;
  animated?: boolean;
  duration?: number;
};

export const ProgressBar = ({
  progress,
  height = 8,
  showLabel = false,
  labelPosition = 'right',
  color,
  style,
  animated = true,
  duration = 500,
}: ProgressBarProps) => {
  const theme = useTheme();
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(progress);
    }
  }, [progress, animated]);

  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const renderLabel = () => {
    if (!showLabel) return null;

    return (
      <Text
        variant="labelMedium"
        style={[
          styles.label,
          labelPosition === 'top' && styles.topLabel,
          labelPosition === 'right' && styles.rightLabel,
          { color: theme.colors.text.secondary },
        ]}
      >
        {`${Math.round(progress * 100)}%`}
      </Text>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {labelPosition === 'top' && renderLabel()}
      <View
        style={[
          styles.track,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: theme.colors.grey[200],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              width,
              height,
              borderRadius: height / 2,
              backgroundColor: color || theme.colors.primary.main,
            },
          ]}
        />
      </View>
      {labelPosition === 'right' && renderLabel()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  label: {
    minWidth: 44,
    textAlign: 'right',
  },
  topLabel: {
    marginBottom: 4,
  },
  rightLabel: {
    marginLeft: 8,
  },
});
