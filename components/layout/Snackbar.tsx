import React from 'react';
import { StyleSheet, Animated, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Button } from '../ui/Button';

const { width } = Dimensions.get('window');

type SnackbarProps = {
  visible: boolean;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  duration?: number;
  onDismiss: () => void;
};

export const Snackbar = ({
  visible,
  message,
  action,
  duration = 4000,
  onDismiss,
}: SnackbarProps) => {
  const theme = useTheme();
  const translateY = React.useRef(new Animated.Value(100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        const timer = setTimeout(onDismiss, duration);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Text
        variant="bodyMedium"
        style={[styles.message, { color: theme.colors.text.primary }]}
      >
        {message}
      </Text>
      {action && (
        <Button
          label={action.label}
          onPress={() => {
            action.onPress();
            onDismiss();
          }}
          mode="text"
          size="small"
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    maxWidth: width - 32,
  },
  message: {
    flex: 1,
    marginRight: 16,
  },
});
