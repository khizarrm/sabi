import React from 'react'
import { StyleSheet, Pressable, Platform } from 'react-native'
import { Text, View } from '@/components/Themed'
import Colors from '@/constants/Colors'
import { useTaskStore } from '@/src/stores/taskStore'

export default function ActiveTaskCard() {
  const activeTask = useTaskStore((s) => s.activeTask)
  const clearActiveTask = useTaskStore((s) => s.clearActiveTask)

  if (!activeTask) return null

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>{activeTask.name}</Text>
        <Text style={styles.eta}>{activeTask.etaMinutes ? `${activeTask.etaMinutes} min` : ''}</Text>
      </View>
      <Text style={styles.subtitle}>Assigned to {activeTask.taskerName}</Text>
      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.secondary]}><Text style={styles.secondaryText}>Details</Text></Pressable>
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
    borderRadius: 20,
    backgroundColor: Colors.light.glass,
    borderWidth: 1,
    borderColor: Colors.light.glassStroke,
    shadowColor: Colors.light.shadowMedium,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    backdropFilter: 'blur(10px)',
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
  eta: {
    color: Colors.light.primary,
    fontFamily: 'Jost_600SemiBold',
    fontSize: 14,
    backgroundColor: Colors.light.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subtitle: {
    marginTop: 8,
    color: Colors.light.neutral600,
    fontSize: 15,
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


