import React from 'react'
import { StyleSheet, Pressable, ScrollView } from 'react-native'
import * as Haptics from 'expo-haptics'
import FontAwesome from '@expo/vector-icons/FontAwesome'
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

  const handleSuggestionPress = (suggestion: typeof suggestions[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    openNewTaskSheet({ category: suggestion.title as any })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Suggestions for you</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {suggestions.map((suggestion, index) => (
          <Pressable
            key={suggestion.title}
            style={styles.suggestionCard}
            onPress={() => handleSuggestionPress(suggestion)}
            hitSlop={8}
          >
            <View style={styles.iconContainer}>
              <FontAwesome 
                name={suggestion.icon as any} 
                size={28} 
                color={Colors.light.primary}
              />
            </View>
            <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
            <Text style={styles.suggestionSubtitle}>{suggestion.subtitle}</Text>
          </Pressable>
        ))}
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  suggestionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.neutral200,
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    width: 160,
    height: 140,
    shadowColor: Colors.light.shadowMedium,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
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