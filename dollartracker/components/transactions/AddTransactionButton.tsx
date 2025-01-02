import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB, Portal, Modal } from 'react-native-paper';
import { TransactionForm } from './TransactionForm';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function AddTransactionButton() {
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  return (
    <>
      <FAB
        icon="plus"
        onPress={showModal}
        style={[styles.fab, { bottom: insets.bottom + 60 }]} // Account for bottom tab bar
        mode="elevated"
      />

      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContent}
        >
          <TransactionForm
            onSuccess={hideModal}
            onCancel={hideModal}
          />
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#4285F4', // Google Blue
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
});
