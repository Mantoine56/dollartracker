import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  Modal as RNModal,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  showCloseButton?: boolean;
  position?: 'center' | 'bottom';
  contentStyle?: ViewStyle;
};

export const Modal = ({
  visible,
  onClose,
  title,
  children,
  style,
  showCloseButton = true,
  position = 'center',
  contentStyle,
}: ModalProps) => {
  const theme = useTheme();
  const { height } = useWindowDimensions();

  const getPositionStyle = (): ViewStyle => {
    switch (position) {
      case 'bottom':
        return {
          justifyContent: 'flex-end',
          paddingBottom: 0,
        };
      default:
        return {
          justifyContent: 'center',
        };
    }
  };

  return (
    <RNModal
      visible={visible}
      onRequestClose={onClose}
      transparent
      statusBarTranslucent
      animationType={position === 'bottom' ? 'slide' : 'fade'}
    >
      <Pressable
        style={[
          styles.overlay,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            ...getPositionStyle(),
          },
        ]}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.background,
              borderRadius: position === 'bottom' ? theme.borderRadius.xl : theme.borderRadius.lg,
              maxHeight: height * 0.9,
            },
            position === 'bottom' && styles.bottomModal,
            style,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title && (
                <Text variant="titleLarge" style={styles.title}>
                  {title}
                </Text>
              )}
              {showCloseButton && (
                <Pressable
                  onPress={onClose}
                  style={[
                    styles.closeButton,
                    { backgroundColor: theme.colors.grey[100] },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={theme.colors.text.primary}
                  />
                </Pressable>
              )}
            </View>
          )}
          <View style={[styles.content, contentStyle]}>{children}</View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 16,
  },
  container: {
    width: '100%',
    minHeight: 100,
    overflow: 'hidden',
  },
  bottomModal: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 16,
  },
  content: {
    padding: 16,
  },
});
