import { StyleSheet, TouchableOpacity } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>
      <Text style={styles.subtitle}>Manage account and preferences</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.row}> 
          <Text style={styles.rowText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}> 
          <Text style={styles.rowText}>Payment Methods</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}> 
          <Text style={styles.rowText}>Settings</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  section: {
    width: '100%',
    paddingHorizontal: 16,
  },
  row: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  rowText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
});
