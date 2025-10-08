import { useState } from 'react'
import { BookOpen, GraduationCap, Users, Award, Menu, X, ChevronRight } from 'lucide-react'
import { AuthModal } from './auth/AuthModal'

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const features = [
    { icon: BookOpen, title: 'AI-Powered Learning', desc: 'Personalized curriculum adapted to your pace' },
    { icon: GraduationCap, title: 'Expert Teachers', desc: 'Learn from certified educators' },
    { icon: Users, title: 'Collaborative Tools', desc: 'Study groups and peer learning' },
    { icon: Award, title: 'Track Progress', desc: 'Detailed analytics and achievements' },
  ]

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  const handleGetStarted = () => {
    setAuthModalOpen(true)
  }

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
            <div className="hidden md:flex gap-8 items-center">
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-indigo-600">Features</button>
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-indigo-600">About</button>
              <button onClick={handleGetStarted} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Get Started</button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => scrollToSection('features')} className="block w-full text-left text-gray-700 hover:text-indigo-600 py-2">Features</button>
              <button onClick={() => scrollToSection('about')} className="block w-full text-left text-gray-700 hover:text-indigo-600 py-2">About</button>
              <button onClick={handleGetStarted} className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Transform Your Learning Journey</h1>
            <p className="text-xl mb-8 text-indigo-100">AI-powered education platform for students and teachers</p>
            <button onClick={handleGetStarted} className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 inline-flex items-center gap-2 transition transform hover:scale-105">
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

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">About Literary Genius Academy</h2>
            <p className="text-lg text-gray-600 mb-8">
              We're revolutionizing education with AI-powered learning tools that adapt to each student's unique needs. 
              Our platform empowers teachers, engages students, and keeps parents informed every step of the way.
            </p>
            <button onClick={handleGetStarted} className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
              Join Us Today
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6" />
                <span className="font-bold">Literary Genius</span>
              </div>
              <p className="text-gray-400 text-sm">Empowering learners worldwide with AI-driven education.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition">Features</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-white transition">Pricing</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-white transition">For Teachers</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-white transition">For Students</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition">About</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-white transition">Contact</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-white transition">Careers</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-white transition">Blog</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={handleGetStarted} className="hover:text-white transition">Privacy Policy</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-white transition">Terms of Service</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-white transition">Cookie Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Literary Genius Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  )
}

