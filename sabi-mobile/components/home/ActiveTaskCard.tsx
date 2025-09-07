import React from 'react'
import { StyleSheet, Pressable, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { Text, View } from '@/components/Themed'
import Colors from '@/constants/Colors'
import { useTaskStore } from '@/src/stores/taskStore'

export default function ActiveTaskCard() {
  const activeTask = useTaskStore((s) => s.activeTask)
  const clearActiveTask = useTaskStore((s) => s.clearActiveTask)
  const router = useRouter()

  if (!activeTask) return null

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>{activeTask.name}</Text>
      </View>
      <View style={styles.assigneeRow}>
        <Image source={{ uri: 'https://i.pravatar.cc/80?img=12' }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.assigneeName}>Divine</Text>
          <Text style={styles.subtitle}>Assigned to Divine</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.secondary]} onPress={() => router.push('/modal')}>
          <Text style={styles.secondaryText}>Chat</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.primary]} onPress={clearActiveTask}><Text style={styles.primaryText}>Complete</Text></Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.neutral200,
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Jost_700Bold',
    fontSize: 18,
    color: Colors.light.neutral800,
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  assigneeName: {
    fontFamily: 'Jost_600SemiBold',
    fontSize: 16,
    color: Colors.light.neutral800,
  },
  subtitle: {
    marginTop: 2,
    color: Colors.light.neutral600,
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    flex: 1,
    alignItems: 'center',
    shadowColor: Colors.light.shadow,
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  primary: {
    backgroundColor: Colors.light.primary,
  },
  primaryText: {
    color: '#FFFFFF',
    fontFamily: 'Jost_700Bold',
    fontSize: 15,
  },
  secondary: {
    backgroundColor: Colors.light.glass,
    borderWidth: 1,
    borderColor: Colors.light.glassStroke,
  },
  secondaryText: {
    color: Colors.light.neutral700,
    fontFamily: 'Jost_500Medium',
    fontSize: 15,
  },
})


