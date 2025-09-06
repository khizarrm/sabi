import { User, Clock, Star } from "lucide-react"

export function ChatMockup() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-jost font-medium text-white/90 mb-4">
          Real conversations, real results
        </h2>
        <p className="text-lg text-white/60 max-w-2xl mx-auto">
          See how Sarah got her tire changed in minutes with a verified professional
        </p>
      </div>

      <div className="glass-card p-6 lg:p-8 max-w-md mx-auto">
        {/* Task Header */}
        <div className="border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-jost font-medium text-white">Marcus T.</h3>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-white/70">4.9</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
            <p className="text-white font-medium">Flat tire replacement</p>
            <p className="text-gray-300 mt-1"> Carleton University - Leeds Parking Lot • $45</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="space-y-4">
          <div className="flex justify-start">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 max-w-xs border border-gray-700/50">
              <p className="text-gray-100 text-sm">Hey! I can't figure out how to change my tire. Are you available?</p>
              <span className="text-xs text-gray-300 mt-1 block">2:14 PM</span>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl rounded-br-md px-4 py-3 max-w-xs">
              <p className="text-white text-sm">I'm at the Leeds parking lot now. Where exactly are you parked?</p>
              <span className="text-xs text-emerald-100 mt-1 block">2:15 PM</span>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 max-w-xs border border-gray-700/50">
              <p className="text-gray-100 text-sm">Section B, near the blue Honda! Thank you so much</p>
              <span className="text-xs text-gray-300 mt-1 block">2:15 PM</span>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl rounded-br-md px-4 py-3 max-w-xs">
              <p className="text-white text-sm">Perfect! I see you. On my way over 👍</p>
              <span className="text-xs text-emerald-100 mt-1 block">2:16 PM</span>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-center gap-2 py-3">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-white/60 font-medium">Marcus is on the way</span>
            <Clock className="w-3 h-3 text-white/60" />
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-white/50">Task completed in 12 minutes • Payment processed automatically</p>
      </div>
    </div>
  )
}
