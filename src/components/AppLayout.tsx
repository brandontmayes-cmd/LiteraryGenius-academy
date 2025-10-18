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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-[#1e3a5f] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <button onClick={scrollToTop} className="flex items-center gap-3 hover:opacity-90 transition">
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/68caf8605a414d406590b724_1760015224395_1fa7a05d.jpeg" 
                alt="Literary Genius Academy" 
                className="w-14 h-14 rounded-full border-2 border-[#d4af37]"
              />
              <span className="text-xl font-bold text-[#f5e6d3]">Literary Genius Academy</span>
            </button>
            <div className="hidden md:flex gap-8 items-center">
              <button onClick={() => scrollToSection('features')} className="text-[#f5e6d3] hover:text-[#d4af37] transition">Features</button>
              <button onClick={() => scrollToSection('about')} className="text-[#f5e6d3] hover:text-[#d4af37] transition">About</button>
              <button onClick={handleGetStarted} className="px-6 py-2 bg-[#d4af37] text-[#1e3a5f] rounded-lg hover:bg-[#c19b2f] transition font-semibold">Get Started</button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-[#f5e6d3]">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1e3a5f] border-t border-[#d4af37]">
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => scrollToSection('features')} className="block w-full text-left text-[#f5e6d3] hover:text-[#d4af37] py-2">Features</button>
              <button onClick={() => scrollToSection('about')} className="block w-full text-left text-[#f5e6d3] hover:text-[#d4af37] py-2">About</button>
              <button onClick={handleGetStarted} className="block w-full px-4 py-2 bg-[#d4af37] text-[#1e3a5f] rounded-lg hover:bg-[#c19b2f] transition font-semibold">Get Started</button>
            </div>
          </div>
        )}
      </nav>



      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1e3a5f] via-[#2d4a6f] to-[#1e3a5f] text-white py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNkNGFmMzciIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#f5e6d3]">Transform Your Learning Journey</h1>
            <p className="text-xl mb-8 text-[#d4af37]">AI-powered education platform for students and teachers</p>
            <button onClick={handleGetStarted} className="px-8 py-4 bg-[#d4af37] text-[#1e3a5f] rounded-lg font-semibold hover:bg-[#c19b2f] inline-flex items-center gap-2 transition transform hover:scale-105 shadow-lg">
              Start Learning <ChevronRight />
            </button>
          </div>
        </div>
      </section>


      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#1e3a5f]">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition border-t-4 border-[#d4af37]">
                <feature.icon className="w-12 h-12 text-[#1e3a5f] mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-[#1e3a5f]">{feature.title}</h3>
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
            <h2 className="text-4xl font-bold mb-6 text-[#1e3a5f]">About Literary Genius Academy</h2>
            <p className="text-lg text-gray-600 mb-8">
              We're revolutionizing education with AI-powered learning tools that adapt to each student's unique needs. 
              Our platform empowers teachers, engages students, and keeps parents informed every step of the way.
            </p>
            <button onClick={handleGetStarted} className="px-8 py-3 bg-[#d4af37] text-[#1e3a5f] rounded-lg font-semibold hover:bg-[#c19b2f] transition shadow-lg">
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

