import { useState } from 'react'
import { BookOpen, GraduationCap, Users, Award, Menu, X, ChevronRight } from 'lucide-react'

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    { icon: BookOpen, title: 'AI-Powered Learning', desc: 'Personalized curriculum adapted to your pace' },
    { icon: GraduationCap, title: 'Expert Teachers', desc: 'Learn from certified educators' },
    { icon: Users, title: 'Collaborative Tools', desc: 'Study groups and peer learning' },
    { icon: Award, title: 'Track Progress', desc: 'Detailed analytics and achievements' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Literary Genius Academy</span>
            </div>
            <div className="hidden md:flex gap-8">
              <a href="#features" className="text-gray-700 hover:text-indigo-600">Features</a>
              <a href="#about" className="text-gray-700 hover:text-indigo-600">About</a>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Get Started</button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Transform Your Learning Journey</h1>
            <p className="text-xl mb-8 text-indigo-100">AI-powered education platform for students and teachers</p>
            <button className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 inline-flex items-center gap-2">
              Start Learning <ChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
                <feature.icon className="w-12 h-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Literary Genius Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
