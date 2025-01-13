import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  Animated,
  Pressable,
  Dimensions,
  PanResponder,
} from 'react-native';
import { useTheme } from 'react-native-paper';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;

type DrawerProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  position?: 'left' | 'right';
};

export const Drawer = ({
  visible,
  onClose,
  children,
  style,
  position = 'left',
}: DrawerProps) => {
  const theme = useTheme();
  const translateX = React.useRef(
    new Animated.Value(position === 'left' ? -DRAWER_WIDTH : DRAWER_WIDTH)
  ).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: position === 'left' ? -DRAWER_WIDTH : DRAWER_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) => {
        return Math.abs(dx) > Math.abs(dy);
      },
      onPanResponderMove: (_, { dx }) => {
        if (position === 'left' && dx < 0) {
          translateX.setValue(dx);
        } else if (position === 'right' && dx > 0) {
          translateX.setValue(dx);
        }
      },
      onPanResponderRelease: (_, { dx }) => {
        if (
          (position === 'left' && dx < -DRAWER_WIDTH / 2) ||
          (position === 'right' && dx > DRAWER_WIDTH / 2)
        ) {
          onClose();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.overlay,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity,
          },
        ]}
      >
        <Pressable style={styles.overlayPressable} onPress={onClose} />
      </Animated.View>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.drawer,
          {
            backgroundColor: theme.colors.background,
            [position]: 0,
            transform: [{ translateX }],
            width: DRAWER_WIDTH,
          },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayPressable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
