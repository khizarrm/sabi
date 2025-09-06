"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Mail, Users, CreditCard } from "lucide-react"

interface WaitlistFormProps {
  compact?: boolean
}

export function WaitlistForm({ compact = false }: WaitlistFormProps) {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return

    const urlParams = new URLSearchParams(window.location.search)
    const emailFromUrl = urlParams.get("email");

    const addEmailToWaitlist = async (email: string, source: string = "stripe_checkout") => {
      try {
        const response = await fetch("/api/waitlist-signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, source }),
        });
        if (!response.ok) {
          throw new Error("Failed to add email to waitlist");
        }
        console.log("Email successfully added to waitlist (from stripe callback)");
      } catch (error) {
        console.error("Error adding email to waitlist (from stripe callback):", error);
      }
    };

    if (urlParams.get("success") === "true") {
      if (emailFromUrl && emailFromUrl.trim()) {
        try {
          setEmail(decodeURIComponent(emailFromUrl));
          setIsSubmitted(true);
          addEmailToWaitlist(decodeURIComponent(emailFromUrl), "stripe_success"); // Add to waitlist after successful stripe
          window.history.replaceState({}, "", window.location.pathname);
        } catch (error) {
          console.error("Error decoding email from URL:", error);
        }
      }
    }

    const fetchWaitlistCount = async () => {
      console.log("Attempting to fetch waitlist count...");
      try {
        const response = await fetch("/api/waitlist-count");
        if (!response.ok) {
          throw new Error("Failed to fetch waitlist count");
        }
        const data = await response.json();
        setWaitlistCount(data.count);
      } catch (error) {
        console.error("Error fetching waitlist count:", error);
        setWaitlistCount(null); // Set to null on error
      }
    };

    fetchWaitlistCount(); // Initial fetch
    const interval = setInterval(fetchWaitlistCount, 30000); // Poll every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true);

    try {
      // Always add to waitlist first, regardless of Stripe or compact form
      const waitlistSignupResponse = await fetch("/api/waitlist-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, source: compact ? "compact_form" : "stripe_pre_checkout" }),
      });

      if (!waitlistSignupResponse.ok) {
        throw new Error("Failed to add email to waitlist initially");
      }
      console.log("Email successfully added to waitlist (pre-checkout)");

      if (compact) {
        // If compact form, we are done after adding to waitlist
        setIsSubmitted(true);
        alert("Successfully joined the waitlist!");
      } else {
        // Proceed with Stripe checkout if not compact
        const response = await fetch("/api/create-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error("Failed to create checkout session");
        }

        const { url } = await response.json();

        if (url) {
          window.open(url, "_blank", "noopener,noreferrer");
        } else {
          throw new Error("No checkout URL received");
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("There was an error processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto">
        <div className="p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 animate-glow">
          <div className="text-center space-y-6">
            <CheckCircle className="w-16 h-16 text-[#004225] mx-auto animate-pulse-slow" />
            <div className="space-y-3">
              <h3 className="text-2xl font-jost font-medium text-white">Success!</h3>
              <p className="text-white/60 font-light">
                {compact
                  ? "You've successfully joined the waitlist!"
                  : "Payment Successful! You're now on the Sabi waitlist"}
              </p>
              <div className="flex items-center justify-center gap-2 text-[#004225] font-medium">
                <Users className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#004225]/20 backdrop-blur-sm rounded-full border border-[#004225]/30">
          <Users className="w-4 h-4 text-[#004225]" />
          {waitlistCount !== null ? (
            <span className="text-[#004225] text-sm font-medium">
              Join 15+ others
            </span>
          ) : (
            <span className="text-[#004225] text-sm font-medium">Loading...</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-2 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-[#004225]/30 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 pr-4 py-4 bg-transparent border-0 text-white placeholder:text-white/40 focus:ring-0 focus:outline-none text-lg font-light"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#004225] hover:bg-[#004225]/80 hover:scale-105 text-white font-medium px-8 py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:scale-100 border-0 shadow-2xl"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              ) : (
                compact ? "Join Waitlist" : <CreditCard className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </form>

      <div className="text-center space-y-2">
        {compact ? (
          <p className="text-white/60 text-lg font-medium">Join our waitlist for early access</p>
        ) : (
          <p className="text-white/60 text-lg font-medium">$10 CAD to join</p>
        )}
        <p className="text-white/40 text-sm font-light tracking-wide">
          Early access • Priority matching • Free first task
        </p>
      </div>
    </div>
  );
}
