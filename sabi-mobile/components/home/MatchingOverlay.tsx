import React, { useEffect, useRef } from 'react'
import { StyleSheet, Animated, Dimensions, Pressable } from 'react-native'
import { Text, View } from '@/components/Themed'
import Colors from '@/constants/Colors'
import { useTaskStore } from '@/src/stores/taskStore'

const { width, height } = Dimensions.get('window')

export default function MatchingOverlay() {
  const matching = useTaskStore((s) => s.matching)
  const cancelMatching = useTaskStore((s) => s.cancelMatching)

  const pulse = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (!matching.isMatching) return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: false }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [matching.isMatching, pulse])

  if (!matching.isMatching) return null

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] })
  const borderOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.1] })

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.pulse, { transform: [{ scale }], opacity: borderOpacity }]} />
      <Text style={styles.title}>Notifying nearby taskers…</Text>
      <Text style={styles.subtitle}>Notified {matching.notifiedCount} taskers {matching.etaRangeText ? `• ETA ${matching.etaRangeText}` : ''}</Text>

      <Pressable onPress={cancelMatching} style={styles.cancelBtn}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  pulse: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    borderWidth: 6,
    borderColor: Colors.light.tint,
  },
  title: {
    fontFamily: 'Jost_700Bold',
    fontSize: 20,
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    color: '#374151',
  },
  cancelBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  cancelText: {
    color: '#111827',
    fontFamily: 'Jost_500Medium',
  },
})


