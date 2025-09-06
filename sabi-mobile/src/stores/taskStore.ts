import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createTask, type CreateTaskData, type Task as ApiTask } from '@/src/api'

export type Task = {
    id: number,
    name: string,
    description: string,
    posterId: string,
    taskerId?: string,
    status: 'pending' | 'matching' | 'assigned' | 'in_progress' | 'completed' | 'cancelled',
}

export type ActiveTask = {
    id: number,
    name: string,
    taskerName?: string,
    etaMinutes?: number,
    status: 'assigned' | 'en_route' | 'arrived' | 'in_progress',
}

export type BudgetRange = {
    min: number
    max: number
}

export type NewTaskDraft = {
    description: string
    category?: 'Delivery' | 'Clean' | 'Fix' | 'Assemble' | 'Other' | 'Custom'
    isNow: boolean
    scheduledAt?: string // ISO string if scheduled
    address: string
    budget: BudgetRange
}

export type MatchingState = {
    isMatching: boolean
    notifiedCount: number
    etaRangeText?: string
}

type TaskStore = {
    // UI state
    isAvailable: boolean
    isNewTaskSheetOpen: boolean

    // Home content state
    quickCategories: Array<NonNullable<NewTaskDraft['category']>>
    locationLabel: string

    // Task states
    draft: NewTaskDraft
    matching: MatchingState
    activeTask?: ActiveTask

    // Actions
    toggleAvailability: () => void
    openNewTaskSheet: (preset?: Partial<NewTaskDraft>) => void
    closeNewTaskSheet: () => void
    updateDraft: (patch: Partial<NewTaskDraft>) => void
    resetDraft: () => void
    postTask: () => void
    cancelMatching: () => void
    simulateMatchFound: () => void
    clearActiveTask: () => void
}

const defaultDraft: NewTaskDraft = {
    description: '',
    category: undefined,
    isNow: true,
    scheduledAt: undefined,
    address: 'Current location',
    budget: { min: 40, max: 80 },
}

export const useTaskStore = create<TaskStore>()(devtools((set, get) => ({
    // UI state
    isAvailable: true,
    isNewTaskSheetOpen: false,

    // Home content
    quickCategories: ['Delivery', 'Clean', 'Fix', 'Assemble', 'Other', 'Custom'],
    locationLabel: 'Mission District, SF',

    // Task states
    draft: defaultDraft,
    matching: { isMatching: false, notifiedCount: 0, etaRangeText: undefined },
    activeTask: undefined,

    // Actions
    toggleAvailability: () => set((state) => ({ isAvailable: !state.isAvailable })),

    openNewTaskSheet: (preset) => set((state) => ({
        isNewTaskSheetOpen: true,
        draft: { ...state.draft, ...(preset || {}) },
    })),

    closeNewTaskSheet: () => set({ isNewTaskSheetOpen: false }),

    updateDraft: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),

    resetDraft: () => set({ draft: { ...defaultDraft } }),

    postTask: async () => {
        const { draft } = get()
        
        // Close sheet and enter matching state
        set({ isNewTaskSheetOpen: false, matching: { isMatching: true, notifiedCount: 0, etaRangeText: '~2–5 min' } })

        try {
            // Create the actual task using API
            const taskData: CreateTaskData = {
                customerId: '00000000-0000-0000-0000-000000000001', // TODO: Replace with actual user ID when auth is ready
                title: draft.description,
                description: draft.description,
                taskAddress: draft.address,
                fixedPrice: draft.budget.max, // Using max budget as fixed price for now
                taskType: draft.isNow ? 'on_demand' : 'scheduled'
            }

            const result = await createTask(taskData)
            
            if (result.success && result.data) {
                console.log('✅ Task created successfully:', result.data.task.id)
                
                // Simulate live updates to notifiedCount to show activity
                let count = 0
                const interval = setInterval(() => {
                    const { matching } = get()
                    if (!matching.isMatching) {
                        clearInterval(interval)
                        return
                    }
                    count = Math.min(count + Math.ceil(Math.random() * 3), 12)
                    set({ matching: { ...matching, notifiedCount: count } })
                }, 800)

                // Reset draft after successful creation
                get().resetDraft()
                
                // TODO: Set up real-time listening for task updates
                // For now, simulate match found after delay
                setTimeout(() => {
                    const { matching } = get()
                    if (!matching.isMatching) return
                    get().simulateMatchFound()
                }, 8000)
                
            } else {
                console.error('❌ Failed to create task:', result.error)
                // Exit matching state on error
                set({ matching: { isMatching: false, notifiedCount: 0, etaRangeText: undefined } })
                // TODO: Show error message to user
            }
        } catch (error) {
            console.error('❌ Error creating task:', error)
            // Exit matching state on error
            set({ matching: { isMatching: false, notifiedCount: 0, etaRangeText: undefined } })
            // TODO: Show error message to user
        }
    },

    cancelMatching: () => set({ matching: { isMatching: false, notifiedCount: 0, etaRangeText: undefined } }),

    simulateMatchFound: () => set((state) => ({
        matching: { isMatching: false, notifiedCount: 0, etaRangeText: undefined },
        activeTask: {
            id: Date.now(),
            name: state.draft.description || 'New task',
            taskerName: 'Alex T.',
            etaMinutes: 7,
            status: 'assigned',
        },
    })),

    clearActiveTask: () => set({ activeTask: undefined }),
})))

export default useTaskStore
