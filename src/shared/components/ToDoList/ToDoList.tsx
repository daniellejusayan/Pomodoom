import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';

import { colors } from '../../../core/theme/colors';
import { Ionicon } from '../Icon/Icon';
import { styles } from './ToDoList.styles';
import type { ToDoItem, ToDoListProps } from './ToDoList.types';

const STORAGE_KEY = '@pomodoom_todos';
const ROW_OPACITY = [1, 0.94, 0.88, 0.82];

const createId = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const ToDoList: React.FC<ToDoListProps> = ({ style, onSelectTask, selectedTaskId }) => {
  const [items, setItems] = useState<ToDoItem[]>([]);
  const [text, setText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const persist = useCallback(async (next: ToDoItem[]) => {
    setItems(next);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setItems(JSON.parse(stored) as ToDoItem[]);
        }
      } catch (error) {
        console.error('Failed to load todos:', error);
      }
    };

    load();
  }, []);

  const handleOpenAddModal = () => {
    setText('');
    setShowAddModal(true);
  };

  const validateTodoText = (value: string) => {
    if (!value) {
      Alert.alert('Validation', 'Task text cannot be empty.');
      return false;
    }

    if (value.length > 200) {
      Alert.alert('Validation', 'Task text must be 200 characters or less.');
      return false;
    }

    if (/\p{C}/u.test(value)) {
      Alert.alert('Validation', 'Task text contains unsupported control characters.');
      return false;
    }

    return true;
  };

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!validateTodoText(trimmed)) {
      return;
    }

    const newItem: ToDoItem = {
      id: createId(),
      text: trimmed,
      completed: false,
    };

    persist([...items, newItem]);
    setText('');
    setShowAddModal(false);
  };

  const toggleItem = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );

    persist(updated);
  };

  const handleSelectTask = (item: ToDoItem) => {
    onSelectTask?.(item);
  };

  const removeItem = (id: string) => {
    const confirmDelete = () => {
      const updated = items.filter((item) => item.id !== id);
      persist(updated);
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to remove this task?')) {
        confirmDelete();
      }
      return;
    }

    Alert.alert('Delete Task', 'Are you sure you want to remove this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: confirmDelete },
    ]);
  };

  const handleDragEnd = ({ data }: { data: ToDoItem[] }) => {
    persist(data);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) {
      return;
    }

    const next = [...items];
    const [movedItem] = next.splice(index, 1);
    next.splice(targetIndex, 0, movedItem);
    persist(next);
  };

  const effectiveSelectedTaskId = selectedTaskId ?? null;

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicon name="checkmark-circle" size={48} color={colors.textSecondary} />
      <Text style={styles.emptyText}>No tasks yet</Text>
      <Text style={styles.emptySubtext}>Tap + to add your first task</Text>
    </View>
  );

  const renderRow = (item: ToDoItem, index: number, isActive = false, drag?: () => void) => {
    const isSelected = item.id === effectiveSelectedTaskId;
    const opacity = item.completed ? 0.6 : ROW_OPACITY[index % ROW_OPACITY.length];

    return (
      <View>
        {index > 0 ? <View style={styles.separator} /> : null}
        <View
          style={[
            styles.itemRow,
            index % 2 === 1 && styles.itemRowAlt,
            isSelected && styles.itemRowActive,
            isActive && styles.itemRowDragging,
            { opacity: isActive ? 1 : opacity },
          ]}
        >
          {Platform.OS === 'web' ? (
            <View style={styles.webReorderButtons}>
              <TouchableOpacity
                onPress={() => moveItem(index, -1)}
                disabled={index === 0}
                style={styles.dragHandle}
              >
                <Ionicon
                  name="chevron-up-outline"
                  size={16}
                  color={index === 0 ? colors.textSecondary : colors.textPrimary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => moveItem(index, 1)}
                disabled={index === items.length - 1}
                style={styles.dragHandle}
              >
                <Ionicon
                  name="chevron-down-outline"
                  size={16}
                  color={index === items.length - 1 ? colors.textSecondary : colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.dragHandle}
              onLongPress={drag}
              delayLongPress={120}
              activeOpacity={0.8}
            >
              <Ionicon name="reorder-two-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          {isSelected ? <View style={styles.activeAccentBar} /> : null}

          <TouchableOpacity style={styles.checkbox} onPress={() => toggleItem(item.id)}>
            <Ionicon
              name={item.completed ? 'checkbox' : 'square-outline'}
              size={22}
              color={isSelected ? colors.primary : item.completed ? colors.success : colors.textSecondary}
            />
          </TouchableOpacity>

          <View style={styles.textColumn}>
            {isSelected ? (
              <View style={styles.activeTaskMeta}>
                <Ionicon name="bookmark" size={12} color={colors.primary} />
                <Text style={styles.activeTaskLabel}>DISPLAY TASK</Text>
              </View>
            ) : null}

            <Text
              style={[
                styles.itemText,
                item.completed && styles.itemTextCompleted,
                isSelected && styles.itemTextActive,
              ]}
              numberOfLines={2}
            >
              {item.text}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.selectButton, isSelected && styles.selectButtonActive]}
            onPress={() => handleSelectTask(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicon
              name={isSelected ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isSelected ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => removeItem(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicon name="trash-outline" size={18} color={colors.danger ?? '#E74C3C'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Ionicon name="list-outline" size={20} color={colors.primary} />
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={styles.spacer} />
        <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
          <Ionicon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        renderEmptyState()
      ) : Platform.OS === 'web' ? (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => renderRow(item, index)}
        />
      ) : (
        <DraggableFlatList
          style={styles.list}
          data={items}
          keyExtractor={(item) => item.id}
          onDragEnd={handleDragEnd}
          activationDistance={10}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          renderItem={({ item, drag, isActive, getIndex }: RenderItemParams<ToDoItem>) => (
            <ScaleDecorator>{renderRow(item, getIndex() ?? 0, isActive, drag)}</ScaleDecorator>
          )}
        />
      )}

      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Task</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="What do you need to do?"
              placeholderTextColor={colors.textSecondary}
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
              autoFocus
              multiline
              maxLength={200}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalAddButton, !text.trim() && styles.modalAddButtonDisabled]}
                onPress={handleAdd}
                disabled={!text.trim()}
              >
                <Text style={styles.modalAddText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default ToDoList;