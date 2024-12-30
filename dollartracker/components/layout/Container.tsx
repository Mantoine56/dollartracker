import React from 'react';
import { StyleSheet, View, ViewStyle, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

type ContainerProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  useSafeArea?: boolean;
  withScrollView?: boolean;
};

export const Container = ({
  children,
  style,
  useSafeArea = true,
  withScrollView = false,
}: ContainerProps) => {
  const theme = useTheme();
  const Wrapper = useSafeArea ? SafeAreaView : View;

  const content = withScrollView ? (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <Wrapper
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        style,
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      {content}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
