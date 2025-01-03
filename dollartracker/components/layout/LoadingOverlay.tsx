import React from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
  transparent?: boolean;
  spinnerSize?: number;
  spinnerColor?: string;
};

export const LoadingOverlay = ({
  visible,
  message,
  transparent = false,
  spinnerSize = 48,
  spinnerColor,
}: LoadingOverlayProps) => {
  const theme = useTheme();
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // Start rotation animation
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: transparent
            ? 'rgba(0, 0, 0, 0.3)'
            : theme.colors.background,
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialCommunityIcons
            name="loading"
            size={spinnerSize}
            color={spinnerColor || theme.colors.primary}
          />
        </Animated.View>
        {message && (
          <Text
            variant="bodyLarge"
            style={[
              styles.message,
              { color: theme.colors.onSurface }
            ]}
          >
            {message}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 10,
    textAlign: 'center',
  },
});
