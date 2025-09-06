import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View as RNView, RefreshControl, Alert } from 'react-native';

import { Text, View } from '@/components/Themed';
import { getUserTasks, type Task } from '@/src/api';

// Mock user ID for now - will be replaced with real auth
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function ActivitiesScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await getUserTasks(TEMP_USER_ID);
      
      if (result.success && result.data) {
        setTasks(result.data);
        console.log('✅ Loaded tasks:', result.data.length);
      } else {
        console.error('❌ Failed to load tasks:', result.error);
        Alert.alert('Error', result.error || 'Failed to load tasks');
      }
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
      Alert.alert('Error', 'Network error - check your connection');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const onRefresh = () => {
    loadTasks(true);
  };

  const formatTaskActivity = (task: Task): string => {
    const price = task.fixed_price || task.agreed_price;
    const priceText = price ? ` - $${price}` : '';
    
    switch (task.status) {
      case 'posted':
        return `Posted: ${task.title}${priceText}`;
      case 'assigned':
        return `Assigned: ${task.title}${priceText}`;
      case 'in_progress':
        return `In Progress: ${task.title}${priceText}`;
      case 'completed':
        return `Completed: ${task.title}${priceText}`;
      case 'cancelled':
        return `Cancelled: ${task.title}`;
      default:
        return `${task.status}: ${task.title}${priceText}`;
    }
  };

  const getStatusColor = (status: Task['status']): string => {
    switch (status) {
      case 'completed':
        return '#059669'; // green
      case 'in_progress':
        return '#D97706'; // orange
      case 'assigned':
        return '#2563EB'; // blue
      case 'posted':
        return '#7C3AED'; // purple
      case 'cancelled':
        return '#DC2626'; // red
      default:
        return '#6B7280'; // gray
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Recent Activities</Text>
        <Text style={styles.loadingText}>Loading your tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Activities</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <RNView style={styles.card}>
            <Text style={styles.cardTitle}>{formatTaskActivity(item)}</Text>
            <Text style={[styles.statusBadge, { color: getStatusColor(item.status) }]}>
              {item.status.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={styles.cardSubtitle}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
            {item.task_address && (
              <Text style={styles.cardAddress}>{item.task_address}</Text>
            )}
          </RNView>
        )}
        ListEmptyComponent={
          <RNView style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>Create your first task to get started!</Text>
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
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 8,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
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
