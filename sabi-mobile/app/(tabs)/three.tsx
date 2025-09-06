
import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View as RNView, RefreshControl, Alert, Pressable } from 'react-native';

import { Text, View } from '@/components/Themed';
import { getAvailableTasks, acceptTask, type Task } from '@/src/api';
import Colors from '@/constants/Colors';

// Mock user ID for now - will be replaced with real auth
const TEMP_TASKER_ID = '00000000-0000-0000-0000-000000000002';

export default function AvailableTasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingTaskId, setAcceptingTaskId] = useState<string | null>(null);

  const loadAvailableTasks = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await getAvailableTasks();
      
      if (result.success && result.data) {
        setTasks(result.data);
        console.log('✅ Loaded available tasks:', result.data.length);
      } else {
        console.error('❌ Failed to load tasks:', result.error);
        Alert.alert('Error', result.error || 'Failed to load available tasks');
      }
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
      Alert.alert('Error', 'Network error - check your connection');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAcceptTask = async (taskId: string) => {
    setAcceptingTaskId(taskId);

    try {
      const result = await acceptTask(taskId, TEMP_TASKER_ID);
      
      if (result.success) {
        Alert.alert('Success', 'Task accepted successfully!');
        // Remove the task from available tasks list
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      } else {
        Alert.alert('Error', result.error || 'Failed to accept task');
      }
    } catch (error) {
      console.error('❌ Error accepting task:', error);
      Alert.alert('Error', 'Network error - check your connection');
    } finally {
      setAcceptingTaskId(null);
    }
  };

  useEffect(() => {
    loadAvailableTasks();
  }, []);

  const onRefresh = () => {
    loadAvailableTasks(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Available Tasks</Text>
        <Text style={styles.loadingText}>Loading available tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <RNView style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
            
            {item.task_address && (
              <Text style={styles.cardAddress}>📍 {item.task_address}</Text>
            )}
            
            <RNView style={styles.priceRow}>
              {item.fixed_price && (
                <Text style={styles.priceText}>${item.fixed_price}</Text>
              )}
              <Text style={styles.dateText}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </RNView>

            <Pressable
              style={[
                styles.acceptButton,
                acceptingTaskId === item.id && styles.acceptButtonDisabled
              ]}
              onPress={() => handleAcceptTask(item.id)}
              disabled={acceptingTaskId === item.id}
            >
              <Text style={styles.acceptButtonText}>
                {acceptingTaskId === item.id ? 'Accepting...' : 'Accept Task'}
              </Text>
            </Pressable>
          </RNView>
        )}
        ListEmptyComponent={
          <RNView style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No available tasks</Text>
            <Text style={styles.emptySubtext}>
              Check back later for new opportunities!
            </Text>
          </RNView>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 32,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardAddress: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  acceptButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
