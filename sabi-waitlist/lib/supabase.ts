export interface WaitlistEntry {
  id: string
  email: string
  payment_status: "pending" | "paid" | "failed"
  stripe_session_id?: string
  amount_paid?: number
  created_at: string
}

// Simulated Supabase client
// export const supabase = {
//   from: (table: string) => ({
//     insert: async (data: Partial<WaitlistEntry>[]) => {
//       // Simulate API call
//       console.log("[v0] Simulated Supabase insert to", table, ":", data)
//       return {
//         data: data.map((item, index) => ({
//           id: `sim_${Date.now()}_${index}`,
//           payment_status: "pending",
//           ...item,
//           created_at: new Date().toISOString(),
//         })),
//         error: null,
//       }
//     },
//     select: async (columns?: string, options?: { count?: string; head?: boolean }) => {
//       if (options?.count === "exact") {
//         return {
//           count: Math.floor(Math.random() * 50) + 1200, // Simulate growing waitlist
//           data: null,
//           error: null,
//         }
//       }
//       return {
//         data: [],
//         error: null,
//       }
//     },
//     update: async (updates: Partial<WaitlistEntry>) => {
//       console.log("[v0] Simulated Supabase update:", updates)
//       return {
//         data: [{ ...updates, updated_at: new Date().toISOString() }],
//         error: null,
//       }
//     },
//     eq: (column: string, value: string) => ({
//       update: async (updates: Partial<WaitlistEntry>) => {
//         console.log(`[v0] Simulated Supabase update where ${column} = ${value}:`, updates)
//         return {
//           data: [{ ...updates, updated_at: new Date().toISOString() }],
//           error: null,
//         }
//       },
//     }),
//   }),
// }

// export const addPaidWaitlistEntry = async (email: string, stripeSessionId: string, amountPaid: number) => {
//   return supabase.from("waitlist").insert([
//     {
//       email,
//       payment_status: "paid" as const,
//       stripe_session_id: stripeSessionId,
//       amount_paid: amountPaid,
//     },
//   ])
// }

// export const updatePaymentStatus = async (stripeSessionId: string, status: "paid" | "failed") => {
//   return supabase.from("waitlist").eq("stripe_session_id", stripeSessionId).update({
//     payment_status: status,
//   })
// }

// export const getWaitlistCount = async () => {
//   return supabase.from("waitlist").select("*", { count: "exact", head: true })
// }

// When ready to implement real Supabase:
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
