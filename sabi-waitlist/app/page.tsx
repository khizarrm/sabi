import { WaitlistForm } from "@/components/waitlist-form"
import { ChatMockup } from "@/components/chat-mockup"
import { HowItWorks } from "@/components/how-it-works"

export default function Home() {
  return (
    <main className="min-h-screen gradient-dark relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/30 to-orange-500/30 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-orange-500/30 to-emerald-500/30 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-4xl mx-auto space-y-12">
          <div className="space-y-6">
            <h1 className="font-niconne text-8xl lg:text-9xl text-white tracking-wide drop-shadow-lg">Sabi</h1>
            <p className="font-jost text-xl lg:text-2xl text-gray-300 font-medium tracking-wide">
              Bringing skills to your door
            </p>
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl lg:text-5xl font-jost font-medium text-gray-100 leading-tight max-w-3xl mx-auto">
              Trusted help when you need it, <span className="text-emerald-400 font-semibold">instantly</span>
            </h2>

            <p className="text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
              Tired of unreliable help? Get{" "}
              <span className="text-gray-200 font-medium">ID-verified</span> for any task. From
              tire changes to grocery runs - we've got you covered.
            </p>
          </div>

          <div className="pt-8">
            <WaitlistForm />
          </div>
        </div>
      </div>

      <section className="relative z-10 py-20 px-6">
        <ChatMockup />
      </section>

      <section className="relative z-10 py-20 px-6">
        <HowItWorks />
      </section>

      <section className="relative z-10 py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-3xl lg:text-4xl font-jost font-medium text-gray-100 mb-8">Ready to get started?</h3>
          <WaitlistForm />
        </div>
      </section>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <p className="text-gray-500 text-sm font-light tracking-wide">Join the revolution</p>
      </div>
    </main>
  )
}
