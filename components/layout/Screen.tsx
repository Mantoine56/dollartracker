import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Container } from './Container';
import { Header } from './Header';

type ScreenProps = {
  children: React.ReactNode;
  title?: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  withScrollView?: boolean;
  contentStyle?: ViewStyle;
  headerStyle?: ViewStyle;
};

export const Screen: React.FC<ScreenProps> = ({
  children,
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  withScrollView = false,
  contentStyle,
  headerStyle,
}) => {
  const theme = useTheme();

  return (
    <Container withScrollView={withScrollView}>
      {title && (
        <Header
          title={title}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          onLeftPress={onLeftPress}
          onRightPress={onRightPress}
          style={headerStyle}
        />
      )}
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
});
