import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  StyleSheet,
  Animated,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastProps = {
  message: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
};

type ToastContextType = {
  showToast: (props: ToastProps) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const translateY = new Animated.Value(-100);
  const opacity = new Animated.Value(0);

  const getToastColor = (type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        return theme.colors.success.main;
      case 'error':
        return theme.colors.error.main;
      case 'warning':
        return theme.colors.warning.main;
      default:
        return theme.colors.primary.main;
    }
  };

  const getToastIcon = (type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert';
      default:
        return 'information';
    }
  };

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setToast(null);
    });
  }, []);

  const showToast = useCallback(
    ({ message, type = 'info', duration = 3000, action }: ToastProps) => {
      setToast({ message, type, duration, action });
      setVisible(true);

      Animated.parallel([
        Animated.timing(translateY, {
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

      if (duration > 0) {
        setTimeout(hideToast, duration);
      }
    },
    [hideToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {visible && toast && (
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY }],
              opacity,
              backgroundColor: theme.colors.surface,
              borderLeftColor: getToastColor(toast.type),
            },
          ]}
        >
          <View style={styles.content}>
            <MaterialCommunityIcons
              name={getToastIcon(toast.type)}
              size={24}
              color={getToastColor(toast.type)}
              style={styles.icon}
            />
            <Text
              variant="bodyMedium"
              style={styles.message}
              numberOfLines={2}
            >
              {toast.message}
            </Text>
            {toast.action && (
              <TouchableOpacity
                onPress={() => {
                  toast.action?.onPress();
                  hideToast();
                }}
              >
                <Text
                  variant="labelLarge"
                  style={[
                    styles.actionLabel,
                    { color: getToastColor(toast.type) },
                  ]}
                >
                  {toast.action.label}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    marginRight: 8,
  },
  actionLabel: {
    fontWeight: '600',
  },
});
