import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TabItem = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  active?: boolean;
};

type BottomBarProps = {
  tabs: TabItem[];
};

export const BottomBar = ({ tabs }: BottomBarProps) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.navigationBar.background,
          borderTopColor: theme.colors.grey[200],
        },
      ]}
    >
      {tabs.map((tab, index) => (
        <Pressable
          key={index}
          style={styles.tab}
          onPress={tab.onPress}
        >
          <MaterialCommunityIcons
            name={tab.icon}
            size={24}
            color={
              tab.active
                ? theme.colors.navigationBar.active
                : theme.colors.navigationBar.inactive
            }
          />
          <Text
            variant="labelMedium"
            style={[
              styles.label,
              {
                color: tab.active
                  ? theme.colors.navigationBar.active
                  : theme.colors.navigationBar.inactive,
              },
            ]}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginTop: 4,
  },
});
