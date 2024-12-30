import React from 'react';
import { StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type FABProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  label?: string;
  position?: 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
};

export const FAB = ({
  icon,
  onPress,
  label,
  position = 'bottomRight',
  style,
  size = 'medium',
}: FABProps) => {
  const theme = useTheme();

  const getPositionStyle = () => {
    switch (position) {
      case 'bottomLeft':
        return { bottom: 16, left: 16 };
      case 'topRight':
        return { top: 16, right: 16 };
      case 'topLeft':
        return { top: 16, left: 16 };
      default:
        return { bottom: 16, right: 16 };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          width: 40,
          height: 40,
          iconSize: 20,
        };
      case 'large':
        return {
          width: 64,
          height: 64,
          iconSize: 32,
        };
      default:
        return {
          width: 56,
          height: 56,
          iconSize: 24,
        };
    }
  };

  const sizeStyle = getSizeStyle();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.primary.main,
          ...getPositionStyle(),
          width: sizeStyle.width,
          height: sizeStyle.height,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={sizeStyle.iconSize}
        color={theme.colors.primary.contrast}
      />
      {label && (
        <Text
          variant="labelMedium"
          style={[styles.label, { color: theme.colors.primary.contrast }]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  label: {
    marginTop: 4,
  },
});
