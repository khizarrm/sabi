import { StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import useAuth from '@/src/hooks/useAuth';

export default function ProfileScreen() {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Guest';
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}> 
      {/* Green header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.light.primary }}>
        <View style={styles.header}> 
          <Image source={{ uri: 'https://i.pravatar.cc/160?img=22' }} style={styles.avatar} />
          <Text style={styles.name}>Hi, {firstName}</Text>
          <Text style={styles.email}>{user?.email ?? 'Welcome to Sabi'}</Text>
          <Pressable style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}>
        {/* Sections */}
          <View style={styles.section}> 
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Account</Text>
            </View>
            <Pressable style={styles.cardRow}>
              <View style={styles.rowLeft}>
                <Ionicons name="person-outline" size={20} color={Colors.light.neutral700} style={{ marginRight: 10 }} />
                <Text style={styles.rowText}>Personal Details</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light.neutral400} />
            </Pressable>
            <Pressable style={styles.cardRow}>
              <View style={styles.rowLeft}>
                <Ionicons name="card-outline" size={20} color={Colors.light.neutral700} style={{ marginRight: 10 }} />
                <Text style={styles.rowText}>Payment Methods</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light.neutral400} />
            </Pressable>
            <Pressable style={styles.cardRow}>
              <View style={styles.rowLeft}>
                <Ionicons name="notifications-outline" size={20} color={Colors.light.neutral700} style={{ marginRight: 10 }} />
                <Text style={styles.rowText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light.neutral400} />
            </Pressable>
          </View>

          <View style={styles.section}> 
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Support</Text>
            </View>
            <Pressable style={styles.cardRow}>
              <View style={styles.rowLeft}>
                <Ionicons name="help-circle-outline" size={20} color={Colors.light.neutral700} style={{ marginRight: 10 }} />
                <Text style={styles.rowText}>Help & FAQs</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light.neutral400} />
            </Pressable>
            <Pressable style={styles.cardRow}>
              <View style={styles.rowLeft}>
                <Ionicons name="chatbubbles-outline" size={20} color={Colors.light.neutral700} style={{ marginRight: 10 }} />
                <Text style={styles.rowText}>Contact Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light.neutral400} />
            </Pressable>
          </View>

          <View style={styles.section}> 
            <Pressable style={[styles.cardRow, styles.logoutRow]}>
              <View style={styles.rowLeft}>
                <Ionicons name="log-out-outline" size={20} color={'#EF4444'} style={{ marginRight: 10 }} />
                <Text style={[styles.rowText, { color: '#EF4444' }]}>Log Out</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light.neutral400} />
            </Pressable>
          </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scroll: {
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginBottom: 12,
  },
  name: {
    fontFamily: 'Jost_700Bold',
    fontSize: 22,
    color: '#FFFFFF',
  },
  email: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Jost_400Regular',
  },
  editBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  editBtnText: {
    fontFamily: 'Jost_700Bold',
    color: Colors.light.neutral800,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitleRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Jost_700Bold',
    fontSize: 16,
    color: Colors.light.neutral700,
  },
  cardRow: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.neutral200,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    fontFamily: 'Jost_500Medium',
    fontSize: 15,
    color: Colors.light.neutral800,
  },
  logoutRow: {
    borderColor: '#FECACA',
  },
});
