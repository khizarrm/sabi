import { StyleSheet, FlatList, View as RNView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';

type Activity = {
  id: string;
  title: string;
  subtitle: string;
  type: 'booking' | 'completed' | 'payment' | 'info';
  time: string;
};

const sampleActivities: Activity[] = [
  { id: '1', title: 'Booked: Barber', subtitle: 'Today at 3:00 PM', type: 'booking', time: '2h ago' },
  { id: '2', title: 'House Cleaning', subtitle: 'Marked as completed', type: 'completed', time: 'Yesterday' },
  { id: '3', title: 'Payment received', subtitle: '$80 from House Cleaning', type: 'payment', time: '2d ago' },
  { id: '4', title: 'Task matched', subtitle: 'Divine accepted your task', type: 'info', time: '3d ago' },
];

function ActivityIcon({ type }: { type: Activity['type'] }) {
  const iconProps = { size: 20, color: Colors.light.primary } as const;
  switch (type) {
    case 'booking':
      return <Ionicons name="calendar-outline" {...iconProps} />;
    case 'completed':
      return <Ionicons name="checkmark-done-outline" {...iconProps} />;
    case 'payment':
      return <Ionicons name="card-outline" {...iconProps} />;
    default:
      return <Ionicons name="information-circle-outline" {...iconProps} />;
  }
}

function TypePill({ type }: { type: Activity['type'] }) {
  const map: Record<Activity['type'], { label: string; bg: string; fg: string }> = {
    booking: { label: 'Booked', bg: Colors.light.primarySoft, fg: Colors.light.primary },
    completed: { label: 'Completed', bg: '#E5F2FF', fg: '#1D4ED8' },
    payment: { label: 'Payment', bg: '#ECFDF5', fg: Colors.light.primary },
    info: { label: 'Update', bg: '#F3F4F6', fg: '#374151' },
  };
  const s = map[type];
  return (
    <RNView style={{ backgroundColor: s.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
      <Text style={{ color: s.fg, fontFamily: 'Jost_600SemiBold', fontSize: 12 }}>{s.label}</Text>
    </RNView>
  );
}

export default function ActivitiesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.light.primary }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Activity</Text>
          <Text style={styles.headerSubtitle}>Your recent updates</Text>
        </View>
      </SafeAreaView>

      <FlatList
        data={sampleActivities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 140 }]}
        renderItem={({ item }) => (
          <RNView style={styles.card}>
            <RNView style={styles.cardRow}>
              <RNView style={styles.iconWrap}>
                <ActivityIcon type={item.type} />
              </RNView>
              <RNView style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </RNView>
              <TypePill type={item.type} />
            </RNView>
            <Text style={styles.timestamp}>{item.time}</Text>
          </RNView>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Jost_700Bold',
    fontSize: 26,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Jost_400Regular',
  },
  listContent: {
    backgroundColor: '#fafafa',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.neutral200,
    padding: 16,
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontFamily: 'Jost_700Bold',
    fontSize: 16,
    color: Colors.light.neutral800,
  },
  cardSubtitle: {
    fontFamily: 'Jost_400Regular',
    fontSize: 13,
    color: Colors.light.neutral600,
    marginTop: 2,
  },
  timestamp: {
    fontFamily: 'Jost_400Regular',
    fontSize: 12,
    color: Colors.light.neutral500,
    marginTop: 2,
  },
});
