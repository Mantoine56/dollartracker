import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import * as Sentry from '@sentry/react-native'; // We'll need to add this dependency

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ 
    error: Error; 
    resetError: () => void;
    retryCount: number;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
}

const MAX_RETRIES = 3;

/**
 * Enhanced Error Boundary with retry logic and error reporting
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={CustomErrorComponent}
 *   onError={(error) => logErrorToService(error)}
 *   maxRetries={3}
 * >
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    if (__DEV__) {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    } else {
      Sentry.captureException(error, {
        extra: {
          componentStack: errorInfo.componentStack,
          retryCount: this.state.retryCount,
        },
      });
    }

    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    const maxRetries = this.props.maxRetries ?? MAX_RETRIES;
    
    if (this.state.retryCount < maxRetries) {
      this.setState(state => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: state.retryCount + 1,
      }));
    } else {
      // If max retries reached, just clear the error state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (hasError && error) {
      if (Fallback) {
        return <Fallback error={error} resetError={this.resetError} retryCount={retryCount} />;
      }

      return (
        <View style={styles.container}>
          <Text variant="headlineSmall" style={styles.title}>
            Something went wrong
          </Text>
          <Text variant="bodyMedium" style={styles.message}>
            {error.message}
          </Text>
          {retryCount < (this.props.maxRetries ?? MAX_RETRIES) && (
            <Button 
              mode="contained" 
              onPress={this.resetError} 
              style={styles.button}
            >
              Try Again ({retryCount + 1}/{this.props.maxRetries ?? MAX_RETRIES})
            </Button>
          )}
          <Button 
            mode="outlined" 
            onPress={() => {/* Implement navigation to support/home */}} 
            style={[styles.button, styles.supportButton]}
          >
            Contact Support
          </Button>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  button: {
    minWidth: 120,
    marginVertical: 8,
  },
  supportButton: {
    marginTop: 8,
  },
});
