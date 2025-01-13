import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type HeaderProps = {
  title: string;
  leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  style?: ViewStyle;
};

export const Header = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  style,
}: HeaderProps) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.grey[200],
        },
        style,
      ]}
    >
      <View style={styles.iconContainer}>
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon}
            size={24}
            color={theme.colors.text.primary}
            onPress={onLeftPress}
            style={styles.icon}
          />
        )}
      </View>

      <Text variant="titleLarge" style={styles.title}>
        {title}
      </Text>

      <View style={styles.iconContainer}>
        {rightIcon && (
          <MaterialCommunityIcons
            name={rightIcon}
            size={24}
            color={theme.colors.text.primary}
            onPress={onRightPress}
            style={styles.icon}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  icon: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});
