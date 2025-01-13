import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, TouchableRipple, Portal, Modal, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './Card';

export type Category = {
  id: string;
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Drinks', icon: 'food' },
  { id: 'transport', name: 'Transport', icon: 'car' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping' },
  { id: 'bills', name: 'Bills', icon: 'file-document' },
  { id: 'entertainment', name: 'Entertainment', icon: 'movie' },
  { id: 'health', name: 'Health', icon: 'medical-bag' },
  { id: 'education', name: 'Education', icon: 'school' },
  { id: 'groceries', name: 'Groceries', icon: 'cart' },
  { id: 'gifts', name: 'Gifts', icon: 'gift' },
  { id: 'sports', name: 'Sports', icon: 'basketball' },
  { id: 'other', name: 'Other', icon: 'dots-horizontal' },
];

type CategoryPickerProps = {
  value?: string;
  onChange: (category: Category) => void;
  categories?: Category[];
  label?: string;
  error?: string;
};

export const CategoryPicker = ({
  value,
  onChange,
  categories = DEFAULT_CATEGORIES,
  label = 'Category',
  error,
}: CategoryPickerProps) => {
  const theme = useTheme();
  const [visible, setVisible] = React.useState(false);

  const selectedCategory = categories.find(cat => cat.id === value);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleSelect = (category: Category) => {
    onChange(category);
    hideModal();
  };

  return (
    <>
      <Card
        onPress={showModal}
        style={[
          styles.selector,
          error && { borderColor: theme.colors.error.main, borderWidth: 1 },
        ]}
      >
        <Text
          variant="bodySmall"
          style={[styles.label, { color: theme.colors.text.secondary }]}
        >
          {label}
        </Text>
        <View style={styles.selectedContainer}>
          {selectedCategory ? (
            <>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.primary.light + '20' },
                ]}
              >
                <MaterialCommunityIcons
                  name={selectedCategory.icon}
                  size={24}
                  color={theme.colors.primary.main}
                />
              </View>
              <Text variant="titleMedium" style={styles.selectedText}>
                {selectedCategory.name}
              </Text>
            </>
          ) : (
            <Text
              variant="titleMedium"
              style={[styles.placeholder, { color: theme.colors.text.muted }]}
            >
              Select a category
            </Text>
          )}
        </View>
      </Card>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Select Category
          </Text>
          <ScrollView style={styles.categoryList}>
            {categories.map(category => (
              <TouchableRipple
                key={category.id}
                onPress={() => handleSelect(category)}
                style={[
                  styles.categoryItem,
                  value === category.id && {
                    backgroundColor: theme.colors.primary.light + '20',
                  },
                ]}
              >
                <View style={styles.categoryContent}>
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor: theme.colors.primary.light + '20',
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={category.icon}
                      size={24}
                      color={theme.colors.primary.main}
                    />
                  </View>
                  <Text variant="titleMedium">{category.name}</Text>
                </View>
              </TouchableRipple>
            ))}
          </ScrollView>
        </Modal>
      </Portal>

      {error && (
        <Text
          variant="bodySmall"
          style={[styles.error, { color: theme.colors.error.main }]}
        >
          {error}
        </Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    padding: 16,
    marginVertical: 8,
  },
  label: {
    marginBottom: 4,
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedText: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
  },
  modal: {
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryList: {
    marginHorizontal: -20,
  },
  categoryItem: {
    padding: 16,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  error: {
    marginTop: 4,
    marginLeft: 12,
  },
});
