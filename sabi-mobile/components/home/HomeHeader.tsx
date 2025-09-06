import React, { useMemo, useState } from 'react'
import { StyleSheet, Platform, View, Switch } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/Themed'
import Colors from '@/constants/Colors'
import useAuth from '@/src/hooks/useAuth'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function HomeHeader() {
  const { user } = useAuth()
  const firstName = useMemo(() => (user?.name ? user.name.split(' ')[0] : 'there'), [user?.name])
  const [isAvailable, setIsAvailable] = useState(true)

  return (
    <LinearGradient
      colors={[Colors.light.primary, Colors.light.primaryLight, 'rgba(250, 250, 250, 0)']}
      locations={[0, 0.6, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 5 }}
      style={styles.gradientContainer}
    >
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <Text style={styles.greeting}>
            {getGreeting()}, {firstName}
          </Text>
          <View style={styles.availabilityRow}>
            <Text style={styles.availabilityText}>
              {isAvailable ? 'Available for tasks' : 'Offline'}
            </Text>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: 'rgba(255,255,255,0.3)', true: 'rgba(255,255,255,0.5)' }}
              thumbColor={isAvailable ? '#FFFFFF' : 'rgba(255,255,255,0.7)'}
              style={styles.switch}
            />
          </View>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradientContainer: {
    paddingTop: Platform.select({ ios: 50, default: 30 }),
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  leftContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Jost_700Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityText: {
    fontSize: 16,
    fontFamily: 'Jost_500Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  switch: {
    marginLeft: 16,
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
})