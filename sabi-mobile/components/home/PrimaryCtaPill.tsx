import React, { useEffect, useRef } from 'react'
import { StyleSheet, Pressable, Animated, Platform } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import * as Haptics from 'expo-haptics'

import Colors from '@/constants/Colors'
import { Text, View } from '@/components/Themed'
import { useTaskStore } from '@/src/stores/taskStore'

export default function PrimaryCtaPill() {
  const openNewTaskSheet = useTaskStore((s) => s.openNewTaskSheet)
  const activeTask = useTaskStore((s) => s.activeTask)

  const scale = useRef(new Animated.Value(1)).current

  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start()
    if (!activeTask) {
      openNewTaskSheet()
    }
  }

  if (activeTask) return null

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}> 
      <Pressable style={styles.pill} onPress={onPress} hitSlop={14}>
        <FontAwesome name="plus" size={18} color="#FFFFFF" />
        <Text style={styles.label}>New Task</Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.select({ ios: 110, default: 96 }),
    alignSelf: 'center',
    shadowColor: Colors.light.shadowStrong,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 120,
  },
  label: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontFamily: 'Jost_700Bold',
    fontSize: 16,
  },
})


