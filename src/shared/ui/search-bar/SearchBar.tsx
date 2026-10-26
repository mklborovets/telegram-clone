import React, { forwardRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Text,
  StyleProp,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { theme } from '../../config/theme';

export interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
}

export const SearchBar = forwardRef<React.ElementRef<typeof TextInput>, SearchBarProps>(
  (
    {
      value,
      onChangeText,
      placeholder = 'Search',
      onClear,
      onCancel,
      showCancelButton = false,
      containerStyle,
      inputContainerStyle,
      ...restProps
    },
    ref
  ) => {
    const handleClear = () => {
      onChangeText('');
      if (onClear) {
        onClear();
      }
    };

    return (
      <View style={[styles.container, containerStyle]}>
        <View style={[styles.inputWrapper, inputContainerStyle]}>
          <Search size={18} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            returnKeyType="search"
            autoCorrect={false}
            {...restProps}
          />
          {value.length > 0 ? (
            <Pressable onPress={handleClear} hitSlop={8} style={styles.clearButton}>
              <X size={16} color={theme.colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {showCancelButton && onCancel ? (
          <Pressable onPress={onCancel} hitSlop={8} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
);

SearchBar.displayName = 'SearchBar';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    height: 38,
    paddingHorizontal: theme.spacing.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.text,
    paddingVertical: 0,
    height: '100%',
  },
  clearButton: {
    padding: 2,
    marginLeft: theme.spacing.xs,
  },
  cancelButton: {
    marginLeft: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  cancelText: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.primary,
  },
});
