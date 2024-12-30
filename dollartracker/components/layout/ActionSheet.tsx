import React from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

type ActionSheetOption = {
  label: string;
  onPress: () => void;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  destructive?: boolean;
};

type ActionSheetProps = {
  visible: boolean;
  onClose: () => void;
  options: ActionSheetOption[];
  title?: string;
  message?: string;
  cancelLabel?: string;
};

export const ActionSheet = ({
  visible,
  onClose,
  options,
  title,
  message,
  cancelLabel = 'Cancel',
}: ActionSheetProps) => {
  const theme = useTheme();
  const translateY = React.useRef(new Animated.Value(height)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          mass: 1.2,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: height,
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
        style={[
          styles.sheet,
          {
            backgroundColor: theme.colors.background,
            transform: [{ translateY }],
          },
        ]}
      >
        {(title || message) && (
          <View style={styles.header}>
            {title && (
              <Text variant="titleLarge" style={styles.title}>
                {title}
              </Text>
            )}
            {message && (
              <Text
                variant="bodyMedium"
                style={[styles.message, { color: theme.colors.text.secondary }]}
              >
                {message}
              </Text>
            )}
          </View>
        )}

        <ScrollView bounces={false} style={styles.optionsContainer}>
          {options.map((option, index) => (
            <Pressable
              key={index}
              style={[
                styles.option,
                {
                  borderTopColor: theme.colors.grey[200],
                  borderTopWidth: index > 0 ? StyleSheet.hairlineWidth : 0,
                },
              ]}
              onPress={() => {
                option.onPress();
                onClose();
              }}
            >
              <View style={styles.optionContent}>
                {option.icon && (
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={24}
                    color={
                      option.destructive
                        ? theme.colors.error.main
                        : theme.colors.text.primary
                    }
                    style={styles.optionIcon}
                  />
                )}
                <Text
                  variant="bodyLarge"
                  style={[
                    option.destructive && { color: theme.colors.error.main },
                  ]}
                >
                  {option.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable
          style={[
            styles.cancelButton,
            {
              backgroundColor: theme.colors.grey[100],
            },
          ]}
          onPress={onClose}
        >
          <Text variant="bodyLarge" style={styles.cancelLabel}>
            {cancelLabel}
          </Text>
        </Pressable>
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
  sheet: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: height * 0.7,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
  },
  message: {
    textAlign: 'center',
  },
  optionsContainer: {
    maxHeight: height * 0.4,
  },
  option: {
    paddingVertical: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  optionIcon: {
    marginRight: 12,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelLabel: {
    fontWeight: '600',
  },
});
