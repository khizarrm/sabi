import { PlusCircle, Zap, Sparkles } from "lucide-react"

const steps = [
  {
    icon: PlusCircle,
    title: "Post Your Task",
    description:
      "Set your price, describe the job, and add any details. From tire changes to grocery runs - we handle it all.",
  },
  {
    icon: Zap,
    title: "AI Finds Your Match",
    description: "Our smart algorithm instantly connects you with ID-verified, qualified professionals in your area.",
  },
  {
    icon: Sparkles,
    title: "Get It Done",
    description: "Chat, track progress, and pay securely through the app. Just like Uber, but for any task.",
  },
]

export function HowItWorks() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-jost font-medium text-white/90 mb-4">How Sabi works</h2>
        <p className="text-lg text-white/60 max-w-2xl mx-auto">
          Three simple steps to get any task done by trusted, qualified professionals
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        {steps.map((step, index) => (
          <div key={index} className="text-center group">
            <div className="relative mb-8">
              <div className="w-24 h-24 glass-card flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-500 hover:bg-gradient-to-br hover:from-emerald-900/30 hover:to-emerald-800/20 border border-emerald-800/20">
                <step.icon className="w-12 h-12 text-emerald-300 group-hover:text-emerald-200 transition-colors duration-300" />
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-emerald-700 to-emerald-800 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg border border-emerald-600/30">
                {index + 1}
              </div>
            </div>
            <h3 className="text-xl font-jost font-medium text-white/90 mb-4">{step.title}</h3>
            <p className="text-white/60 leading-relaxed font-light">{step.description}</p>
          </div>
        ))}
      </div>
     </div>
  )
}
