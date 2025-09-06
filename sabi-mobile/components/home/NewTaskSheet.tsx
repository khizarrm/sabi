import React, { useMemo, useRef, useCallback } from 'react'
import { StyleSheet, TextInput, View as RNView, Pressable, Platform } from 'react-native'
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import * as Haptics from 'expo-haptics'

import { Text, View } from '@/components/Themed'
import Colors from '@/constants/Colors'
import { useTaskStore } from '@/src/stores/taskStore'

export default function NewTaskSheet() {
  const sheetOpen = useTaskStore((s) => s.isNewTaskSheetOpen)
  const draft = useTaskStore((s) => s.draft)
  const updateDraft = useTaskStore((s) => s.updateDraft)
  const closeSheet = useTaskStore((s) => s.closeNewTaskSheet)
  const postTask = useTaskStore((s) => s.postTask)

  const sheetRef = useRef<BottomSheetModal>(null)
  const snapPoints = useMemo(() => ['45%', '80%'], [])

  const onPresent = useCallback(() => sheetRef.current?.present(), [])
  const onDismiss = useCallback(() => sheetRef.current?.dismiss(), [])

  React.useEffect(() => {
    if (sheetOpen) onPresent()
    else onDismiss()
  }, [sheetOpen, onPresent, onDismiss])

  const canPost = draft.description.trim().length > 0

  const onPost = () => {
    if (!canPost) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    postTask()
  }

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={closeSheet}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handle}
      keyboardBehavior="interactive"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>New Task</Text>

        {/* Step 1 - What */}
        <Text style={styles.label}>What do you need?</Text>
        <RNView style={styles.inputWrap}>
          <TextInput
            placeholder="Describe what you need (e.g., Assemble IKEA shelf)"
            value={draft.description}
            onChangeText={(t) => updateDraft({ description: t })}
            style={styles.input}
            placeholderTextColor="#9CA3AF"
            returnKeyType="next"
          />
        </RNView>

        {/* Step 2 - When & Where (simplified MVP) */}
        <RNView style={styles.row}>
          <Pressable
            onPress={() => updateDraft({ isNow: true, scheduledAt: undefined })}
            style={[styles.toggle, draft.isNow && styles.toggleOn]}
          >
            <Text style={[styles.toggleText, draft.isNow && styles.toggleTextOn]}>Now</Text>
          </Pressable>
          <Pressable
            onPress={() => updateDraft({ isNow: false })}
            style={[styles.toggle, !draft.isNow && styles.toggleOn]}
          >
            <Text style={[styles.toggleText, !draft.isNow && styles.toggleTextOn]}>Schedule</Text>
          </Pressable>
        </RNView>

        <RNView style={styles.inputWrap}>
          <TextInput
            placeholder="Address"
            value={draft.address}
            onChangeText={(t) => updateDraft({ address: t })}
            style={styles.input}
            placeholderTextColor="#9CA3AF"
            returnKeyType="next"
          />
        </RNView>

        {/* Step 3 - Budget (simplified MVP inputs) */}
        <RNView style={styles.row}>
          <RNView style={[styles.inputWrap, styles.inlineInput]}> 
            <TextInput
              placeholder="Min $"
              keyboardType="numeric"
              value={String(draft.budget.min)}
              onChangeText={(t) => updateDraft({ budget: { ...draft.budget, min: Number(t) || 0 } })}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              returnKeyType="next"
            />
          </RNView>
          <RNView style={[styles.inputWrap, styles.inlineInput]}> 
            <TextInput
              placeholder="Max $"
              keyboardType="numeric"
              value={String(draft.budget.max)}
              onChangeText={(t) => updateDraft({ budget: { ...draft.budget, max: Number(t) || 0 } })}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              returnKeyType="done"
            />
          </RNView>
        </RNView>

        <Pressable
          onPress={onPost}
          disabled={!canPost}
          style={[styles.primaryBtn, !canPost && styles.primaryBtnDisabled]}
        >
          <Text style={styles.primaryBtnText}>Post Task</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  handle: {
    backgroundColor: '#E5E7EB',
    width: 44,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'Jost_700Bold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 10,
  },
  label: {
    marginTop: 6,
    marginBottom: 6,
    fontSize: 13,
    color: '#374151',
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, default: 8 }),
    marginBottom: 12,
  },
  input: {
    fontSize: 15,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inlineInput: {
    flex: 1,
    marginRight: 8,
  },
  toggle: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  toggleOn: {
    borderColor: Colors.light.tint,
  },
  toggleText: {
    color: '#374151',
    fontFamily: 'Jost_500Medium',
  },
  toggleTextOn: {
    color: Colors.light.tint,
  },
  primaryBtn: {
    marginTop: 6,
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: '#A7F3D0',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Jost_700Bold',
    fontSize: 16,
  },
})


