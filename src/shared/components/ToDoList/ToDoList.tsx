import React, { useEffect, useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  FlatList, 
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicon } from '../Icon/Icon';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ToDoItem, ToDoListProps } from './ToDoList.types';
import { styles } from './ToDoList.styles';
import { colors } from '../../../core/theme/colors';

const STORAGE_KEY = '@pomodoom_todos';

export const ToDoList: React.FC<ToDoListProps> = ({ style }) => {
  const [items, setItems] = useState<ToDoItem[]>([]);
  const [text, setText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setItems(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load todos:', error);
      }
    };
    load();
  }, []);

  const persist = async (next: ToDoItem[]) => {
    try {
      setItems(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  };

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
    if (!validateTodoText(trimmed)) return;
    
    const newItem: ToDoItem = { 
      id: Date.now().toString() + Math.floor(Math.random() * 1000), 
      text: trimmed, 
      completed: false 
    };
    persist([newItem, ...items]);
    setText('');
    setShowAddModal(false);
  };

  const toggleItem = (id: string) => {
    const updated = items.map(i =>
      i.id === id ? { ...i, completed: !i.completed } : i
    );
    persist(updated);
  };

 const removeItem = (id: string) => {
  console.log('removeItem called for', id);
  // on web, Alert.alert only shows a simple box with OK and ignores buttons
  // so use window.confirm for proper confirm/cancel behaviour
  if (Platform.OS === 'web') {
    if (window.confirm('Are you sure you want to remove this task?')) {
      const updated = items.filter(i => i.id !== id);
      persist(updated);
    }
    return;
  }

  Alert.alert(
    'Delete Task',  // Title
    'Are you sure you want to remove this task?',  // Message
    [
      { 
        text: 'Cancel', 
        style: 'cancel',
      },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: () => {
          const updated = items.filter(i => i.id !== id);
          persist(updated);
        },
      },
    ],
    { cancelable: true }  // 🔧 Added: Allows dismissing by tapping outside
  );
};

  const renderItem = ({ item }: { item: ToDoItem }) => (
    <View style={styles.itemRow}>
      {/* Checkbox */}
      <TouchableOpacity 
        style={styles.checkbox} 
        onPress={() => toggleItem(item.id)}
      >
        <Ionicon 
          name={item.completed ? 'checkbox' : 'square-outline'} 
          size={24} 
          color={item.completed ? colors.primary : colors.textSecondary} 
        />
      </TouchableOpacity>

      {/* Task Text */}
      <Text
        style={[
          styles.itemText,
          item.completed && styles.itemTextCompleted,
        ]}
        numberOfLines={2}
      >
        {item.text}
      </Text>

      {/* Delete Button */}
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => removeItem(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicon 
          name="trash-outline" 
          size={20} 
          color={colors.danger || '#E74C3C'} 
        />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicon name="checkmark-circle-outline" size={48} color={colors.textSecondary} />
      <Text style={styles.emptyText}>No tasks yet</Text>
      <Text style={styles.emptySubtext}>Tap + to add your first task</Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}> 
      {/* Header */}
      <View style={styles.header}>
        <Ionicon name="list-outline" size={20} color={colors.primary} />
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={styles.spacer} />
        <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
          <Ionicon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <FlatList
        style={styles.list}
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={items.length === 0 ? styles.emptyListContent : undefined}
      />

      {/* Add Task Modal */}
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
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.modalAddButton,
                  !text.trim() && styles.modalAddButtonDisabled
                ]} 
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