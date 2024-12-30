import React from 'react';
import { StyleSheet, ViewStyle, Animated, Pressable } from 'react-native';
import { useTheme } from 'react-native-paper';
import { pressAnimation } from './utils/animations';

type CardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevation?: 'none' | 'small' | 'medium' | 'large';
};

export const Card = ({
  children,
  onPress,
  style,
  elevation = 'medium',
}: CardProps) => {
  const theme = useTheme();
  const scale = React.useRef(new Animated.Value(1)).current;
  const { onPressIn, onPressOut } = pressAnimation(scale);

  const getElevation = () => {
    switch (elevation) {
      case 'none':
        return theme.shadows.none;
      case 'small':
        return theme.shadows.sm;
      case 'large':
        return theme.shadows.lg;
      default:
        return theme.shadows.md;
    }
  };

  const CardContainer = onPress ? Pressable : View;

  return (
    <Animated.View
      style={[
        { transform: [{ scale }] },
      ]}
    >
      <CardContainer
        onPress={onPress}
        onPressIn={onPress ? onPressIn : undefined}
        onPressOut={onPress ? onPressOut : undefined}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            ...getElevation(),
          },
          style,
        ]}
      >
        {children}
      </CardContainer>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
