import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EditButtonProps {
  onPress: () => void;
  style?: any;
}

export default function EditButton({ onPress, style }: EditButtonProps) {
  return (
    <TouchableOpacity style={[styles.editButton, style]} onPress={onPress}>
      <Text style={styles.editText}>Edit</Text>
      <Ionicons name="pencil" size={16} color="#8B5CF6" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF620',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  editText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});