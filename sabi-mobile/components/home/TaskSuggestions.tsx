import React from 'react'
import { StyleSheet, Pressable } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Text, View } from '@/components/Themed'
import Colors from '@/constants/Colors'
import { useTaskStore } from '@/src/stores/taskStore'

const suggestions = [
  { title: 'Quick delivery', subtitle: 'Get something delivered nearby', icon: 'truck' },
  { title: 'House cleaning', subtitle: 'Professional cleaning service', icon: 'home' },
  { title: 'Handyman help', subtitle: 'Fix, install, or repair something', icon: 'wrench' },
  { title: 'Food pickup', subtitle: 'Pick up food from restaurants', icon: 'cutlery' },
  { title: 'Moving help', subtitle: 'Help with moving or heavy lifting', icon: 'cube' },
  { title: 'Pet care', subtitle: 'Walking, sitting, or pet care', icon: 'paw' },
]

export default function TaskSuggestions() {
  const openNewTaskSheet = useTaskStore((s) => s.openNewTaskSheet)
  const isMatching = useTaskStore((s) => s.matching.isMatching)
  const activeTask = useTaskStore((s) => s.activeTask)

  const mapToCategory = (title: string): 'Delivery' | 'Clean' | 'Fix' | 'Assemble' | 'Other' | 'Custom' => {
    const t = title.toLowerCase()
    if (t.includes('delivery') || t.includes('pickup')) return 'Delivery'
    if (t.includes('clean')) return 'Clean'
    if (t.includes('handyman') || t.includes('fix') || t.includes('repair')) return 'Fix'
    if (t.includes('assemble')) return 'Assemble'
    return 'Other'
  }

  const handleSuggestionPress = (suggestion: typeof suggestions[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    openNewTaskSheet({
      category: mapToCategory(suggestion.title),
      description: `${suggestion.title} — ${suggestion.subtitle}`,
      isNow: true,
    })
  }

  if (isMatching || activeTask) return null

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Suggestions for you</Text>
      <View style={styles.grid}>
        {suggestions.map((suggestion, index) => (
          <Pressable
            key={suggestion.title}
            style={[
              styles.suggestionCard,
              index % 2 === 0 ? styles.cardLeft : styles.cardRight,
            ]}
            onPress={() => handleSuggestionPress(suggestion)}
            hitSlop={8}
          >
            <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
            <Text style={styles.suggestionSubtitle}>{suggestion.subtitle}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Jost_700Bold',
    color: Colors.light.neutral800,
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  grid: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.neutral200,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexBasis: '48%',
    minHeight: 120,
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cardLeft: { marginRight: '4%' },
  cardRight: {},
  suggestionTitle: {
    fontSize: 16,
    fontFamily: 'Jost_700Bold',
    color: Colors.light.neutral800,
    marginBottom: 6,
  },
  suggestionSubtitle: {
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
    color: Colors.light.neutral600,
    lineHeight: 18,
    flex: 1,
  },
})