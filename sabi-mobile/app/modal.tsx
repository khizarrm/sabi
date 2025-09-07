import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';

type Message = { id: string; sender: 'me' | 'tasker'; text: string };

export default function ModalScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'tasker', text: 'Hi! I’m Divine. I can help with this task.' },
    { id: '2', sender: 'me', text: 'Awesome! I need it done today if possible.' },
    { id: '3', sender: 'tasker', text: 'No problem. Any specific details I should know?' },
  ]);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  const sendMessage = () => {
    if (!draft.trim()) return;
    const newMsg: Message = { id: Date.now().toString(), sender: 'me', text: draft.trim() };
    setMessages((prev) => [...prev, newMsg]);
    setDraft('');
  };

  useEffect(() => {
    // Auto scroll to bottom on new message
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.length]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: 'https://i.pravatar.cc/80?img=12' }} style={styles.headerAvatar} />
            <View>
              <Text style={styles.headerTitle}>Divine</Text>
              <Text style={styles.headerSubtitle}>Typically replies within 5 min</Text>
            </View>
          </View>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}><Text style={styles.closeText}>Close</Text></Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messages}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.sender === 'me' ? styles.mine : styles.theirs]}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
        />

        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <Pressable onPress={sendMessage} style={styles.sendBtn}><Text style={styles.sendText}>Send</Text></Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontFamily: 'Jost_700Bold', fontSize: 18, color: Colors.light.neutral800 },
  headerSubtitle: { fontFamily: 'Jost_400Regular', fontSize: 12, color: Colors.light.neutral500 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.light.glass,
    borderWidth: 1,
    borderColor: Colors.light.glassStroke,
    borderRadius: 10,
  },
  closeText: { color: Colors.light.neutral800, fontFamily: 'Jost_500Medium' },
  messages: { padding: 16, paddingBottom: 100 },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 10,
    maxWidth: '80%',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  theirs: { backgroundColor: '#F3F4F6', alignSelf: 'flex-start' },
  mine: { backgroundColor: Colors.light.primarySoft, alignSelf: 'flex-end' },
  messageText: { color: Colors.light.neutral800, fontFamily: 'Jost_400Regular', fontSize: 15 },
  inputRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  sendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.light.primary,
    borderRadius: 999,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  sendText: { color: '#FFFFFF', fontFamily: 'Jost_700Bold' },
});
