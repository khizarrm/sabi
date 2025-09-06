const testimonials = [
  {
    name: "Sarah Chen",
    role: "Busy Parent",
    content: "Finally, an app that gets it. I can focus on my kids while someone else handles the grocery shopping.",
    avatar: "/professional-woman-smiling.png",
  },
  {
    name: "Marcus Rodriguez",
    role: "Startup Founder",
    content: "SABI saves me 10+ hours a week. Time I can now spend growing my business instead of running errands.",
    avatar: "/professional-bearded-man.png",
  },
  {
    name: "Emily Watson",
    role: "Senior Executive",
    content: "The quality of service providers is exceptional. Every task is completed exactly as requested.",
    avatar: "/professional-woman-glasses.png",
  },
]

export function TestimonialSection() {
  return (
    <section className="py-20 bg-forest-800/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Loved by Busy People Everywhere</h2>
          <p className="text-forest-200 text-lg">
            Join the beta and see why early users can't imagine life without SABI.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-peach-300 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-forest-100 leading-relaxed italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
