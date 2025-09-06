import React from 'react'
import { StyleSheet, ScrollView, Pressable } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Text, View } from '@/components/Themed'
import Colors from '@/constants/Colors'
import { useTaskStore } from '@/src/stores/taskStore'

export default function QuickChipsRow() {
  const categories = useTaskStore((s) => s.quickCategories)
  const openNewTaskSheet = useTaskStore((s) => s.openNewTaskSheet)

  const onPressChip = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const preset = category === 'Custom' ? { category: undefined } : { category: category as any }
    openNewTaskSheet({ ...preset })
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        {categories.map((c, index) => (
          <Pressable key={c} onPress={() => onPressChip(c)} style={[
            styles.chip,
            c === 'Custom' && styles.customChip,
          ]} hitSlop={10}>
            <Text style={[
              styles.chipText,
              c === 'Custom' && styles.customChipText
            ]}>
              {c === 'Custom' ? '+ Custom' : c}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  chip: {
    marginRight: 12,
    backgroundColor: Colors.light.glass,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.light.glassStroke,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    backdropFilter: 'blur(10px)',
  },
  chipText: {
    color: Colors.light.neutral700,
    fontFamily: 'Jost_500Medium',
    fontSize: 15,
  },
  customChip: {
    backgroundColor: Colors.light.primarySoft,
    borderColor: Colors.light.primary,
    borderWidth: 1.5,
  },
  customChipText: {
    color: Colors.light.primary,
    fontFamily: 'Jost_700Bold',
  },
})


