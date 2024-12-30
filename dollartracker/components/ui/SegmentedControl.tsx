import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type SegmentOption = {
  label: string;
  value: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
};

type SegmentedControlProps = {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  style?: ViewStyle;
};

export const SegmentedControl = ({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.grey[100],
          borderRadius: theme.borderRadius.round,
        },
        style,
      ]}
    >
      {options.map((option, index) => {
        const isSelected = option.value === value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <TouchableRipple
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.option,
              {
                borderTopLeftRadius: isFirst ? theme.borderRadius.round : 0,
                borderBottomLeftRadius: isFirst ? theme.borderRadius.round : 0,
                borderTopRightRadius: isLast ? theme.borderRadius.round : 0,
                borderBottomRightRadius: isLast ? theme.borderRadius.round : 0,
                backgroundColor: isSelected
                  ? theme.colors.primary.main
                  : 'transparent',
              },
            ]}
          >
            <View style={styles.optionContent}>
              {option.icon && (
                <MaterialCommunityIcons
                  name={option.icon}
                  size={20}
                  color={isSelected ? theme.colors.primary.contrast : theme.colors.text.secondary}
                  style={styles.icon}
                />
              )}
              <Text
                variant="bodyMedium"
                style={[
                  styles.label,
                  {
                    color: isSelected
                      ? theme.colors.primary.contrast
                      : theme.colors.text.secondary,
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}
              >
                {option.label}
              </Text>
            </View>
          </TouchableRipple>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    marginVertical: 8,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6,
  },
  label: {
    textAlign: 'center',
  },
});
