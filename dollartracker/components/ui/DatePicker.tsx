import React, { useState } from 'react';
import { StyleSheet, Platform, ViewStyle } from 'react-native';
import { Button, Modal, Portal, Text, useTheme } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Card } from './Card';

type DatePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  mode?: 'date' | 'datetime';
  style?: ViewStyle;
  minDate?: Date;
  maxDate?: Date;
};

export const DatePicker = ({
  value,
  onChange,
  label,
  mode = 'date',
  style,
  minDate,
  maxDate,
}: DatePickerProps) => {
  const theme = useTheme();
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempDate(selectedDate);
      } else {
        onChange(selectedDate);
      }
    }
  };

  const handlePress = () => {
    setTempDate(value);
    setShow(true);
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setShow(false);
  };

  const handleCancel = () => {
    setShow(false);
  };

  const formatDate = (date: Date) => {
    if (mode === 'datetime') {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <Card
        onPress={handlePress}
        style={[styles.container, style]}
        elevation="small"
      >
        {label && (
          <Text
            variant="bodySmall"
            style={[styles.label, { color: theme.colors.text.secondary }]}
          >
            {label}
          </Text>
        )}
        <Text variant="titleMedium">{formatDate(value)}</Text>
      </Card>

      {Platform.OS === 'ios' ? (
        <Portal>
          <Modal
            visible={show}
            onDismiss={handleCancel}
            contentContainerStyle={[
              styles.modal,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <DateTimePicker
              value={tempDate}
              mode={mode}
              display="spinner"
              onChange={handleChange}
              minimumDate={minDate}
              maximumDate={maxDate}
            />
            <Button onPress={handleCancel}>Cancel</Button>
            <Button onPress={handleConfirm}>Confirm</Button>
          </Modal>
        </Portal>
      ) : (
        show && (
          <DateTimePicker
            value={value}
            mode={mode}
            is24Hour={true}
            onChange={handleChange}
            minimumDate={minDate}
            maximumDate={maxDate}
          />
        )
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
  },
  label: {
    marginBottom: 4,
  },
  modal: {
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
});
