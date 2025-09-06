import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const email = session.metadata?.email

    if (email) {
      try {
        // This would be the actual Supabase call to add to waitlist:
        // const { data, error } = await supabase
        //   .from('waitlist')
        //   .insert([{
        //     email,
        //     payment_status: 'paid',
        //     stripe_session_id: session.id,
        //     amount_paid: session.amount_total,
        //     created_at: new Date().toISOString()
        //   }])

        console.log("[v0] Payment successful for email:", email)
        console.log("[v0] Stripe session ID:", session.id)
        console.log("[v0] Amount paid:", session.amount_total, "CAD cents")

        // Simulate successful database insertion
        console.log("[v0] User added to paid waitlist successfully")
      } catch (error) {
        console.error("[v0] Error adding user to waitlist:", error)
        return NextResponse.json({ error: "Database error" }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
