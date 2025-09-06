import { Clock, Shield, CreditCard, Users, MapPin, Star } from "lucide-react"

const features = [
  {
    icon: Clock,
    title: "Lightning Fast",
    description: "Get matched with available professionals in under 2 minutes",
  },
  {
    icon: Shield,
    title: "Fully Insured",
    description: "All service providers are background-checked and insured",
  },
  {
    icon: CreditCard,
    title: "Seamless Payments",
    description: "Pay securely through the app with transparent pricing",
  },
  {
    icon: Users,
    title: "Skilled Professionals",
    description: "Vetted experts ready to handle any task, big or small",
  },
  {
    icon: MapPin,
    title: "Real-time Tracking",
    description: "Track your service provider from start to finish",
  },
  {
    icon: Star,
    title: "Quality Guaranteed",
    description: "Rate and review every service for continuous improvement",
  },
]

export function FeatureGrid() {
  return (
    <section className="py-20 bg-forest-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Why Choose SABI?</h2>
          <p className="text-forest-200 text-lg max-w-2xl mx-auto">
            We've reimagined personal assistance to be faster, safer, and more reliable than ever before.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-peach-500 to-peach-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-forest-200 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
