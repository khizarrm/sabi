import React, { useEffect, useRef } from 'react'
import { StyleSheet, Animated, Dimensions, Pressable } from 'react-native'
import { Text, View } from '@/components/Themed'
import Colors from '@/constants/Colors'
import { useTaskStore } from '@/src/stores/taskStore'

const { width, height } = Dimensions.get('window')

export default function MatchingOverlay() {
  const matching = useTaskStore((s) => s.matching)
  const cancelMatching = useTaskStore((s) => s.cancelMatching)

  // Indeterminate loading bar animation
  const progress = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (!matching.isMatching) return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [matching.isMatching, progress])

  if (!matching.isMatching) return null

  const trackWidth = width * 0.7
  const indicatorWidth = trackWidth * 0.38
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-indicatorWidth, trackWidth] })

  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>Notifying nearby taskers…</Text>
      <Text style={styles.subtitle}>Notified {matching.notifiedCount} taskers {matching.etaRangeText ? `• ETA ${matching.etaRangeText}` : ''}</Text>

      <View style={[styles.track, { width: trackWidth }]}> 
        <Animated.View style={[styles.indicator, { width: indicatorWidth, transform: [{ translateX }] }]} />
      </View>

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
    backgroundColor: '#FFFFFF',
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
  track: {
    marginTop: 16,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#EFF6F0',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  indicator: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.light.tint,
  },
  cancelBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cancelText: {
    color: '#111827',
    fontFamily: 'Jost_500Medium',
  },
})


