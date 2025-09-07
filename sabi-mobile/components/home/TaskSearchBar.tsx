import React from 'react'
import { StyleSheet, Pressable } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Text, View } from '@/components/Themed'
import Colors from '@/constants/Colors'
import { useTaskStore } from '@/src/stores/taskStore'

export default function TaskSearchBar() {
  const openNewTaskSheet = useTaskStore((s) => s.openNewTaskSheet)

  const handlePress = () => {
    openNewTaskSheet()
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.searchBar} onPress={handlePress} hitSlop={8}>
        <FontAwesome name="search" size={18} color={Colors.light.neutral500} style={styles.icon} />
        <Text style={styles.placeholder}>What do you need help with?</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.glass,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: 9999,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  icon: {
    marginRight: 12,
  },
  placeholder: {
    fontSize: 16,
    color: Colors.light.neutral500,
    fontFamily: 'Jost_400Regular',
    flex: 1,
  },
})