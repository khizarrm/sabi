import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: "Sabi Waitlist - Early Access",
              description: "Join the Sabi waitlist and get priority access when we launch",
            },
            unit_amount: 1000, // 10 CAD in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}?success=true&email=${encodeURIComponent(email)}`,
      cancel_url: `${request.nextUrl.origin}?canceled=true`,
      customer_email: email,
      metadata: {
        email: email,
        type: "waitlist_signup",
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
