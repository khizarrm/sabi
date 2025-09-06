import { StyleSheet, FlatList, View as RNView } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

const sampleActivities = [
  { id: '1', title: 'Booked: Barber - 3pm' },
  { id: '2', title: 'Completed: House Cleaning' },
  { id: '3', title: 'Payment received: $80' },
];

export default function ActivitiesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Activities</Text>
      <FlatList
        data={sampleActivities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <RNView style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </RNView>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginHorizontal: 16,
  },
  cardTitle: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
});
