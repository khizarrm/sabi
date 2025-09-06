import type React from "react"
import type { Metadata } from "next"
import { Jost, Niconne } from "next/font/google"
import "./globals.css"

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["400", "500", "600"],
})

const niconne = Niconne({
  subsets: ["latin"],
  variable: "--font-niconne",
  weight: "400",
})

export const metadata: Metadata = {
  title: "SABI - Bringing Skills to Your Door",
  description:
    "Join the waitlist for SABI, the revolutionary app that connects you with skilled professionals for any errand or task.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${jost.variable} ${niconne.variable} antialiased`}>
      <body className="font-jost bg-black">{children}</body>
    </html>
  )
}
