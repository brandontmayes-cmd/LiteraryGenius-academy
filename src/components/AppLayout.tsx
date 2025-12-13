import { useState } from 'react'
import { BookOpen, Sparkles, Award, Heart, Mail, X, ChevronRight, Star, Zap, Users, Camera, LogIn } from 'lucide-react'
import { AuthModal } from './auth/AuthModal'

export default function AppLayout() {
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-[#1a2744]/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-[#ffd700]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[#ffd700] rounded-xl blur-sm opacity-50"></div>
                <div className="relative h-12 w-12 bg-[#ffd700] rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[#1a2744]" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-[#ffd700]">
                  Literary Genius Academy
                </div>
                <div className="text-xs text-gray-300">Where Young Authors Are Born</div>
              </div>
            </div>
            <div className="hidden md:flex gap-8 items-center">
              <button onClick={() => scrollToSection('features')} className="text-gray-200 hover:text-[#ffd700] transition font-medium">Features</button>
              <button onClick={() => scrollToSection('about')} className="text-gray-200 hover:text-[#ffd700] transition font-medium">About</button>
              {/* SUBTLE LOGIN */}
              <button 
                onClick={() => setAuthModalOpen(true)} 
                className="text-gray-300 hover:text-[#ffd700] transition text-sm flex items-center gap-1"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>        
              <button onClick={() => setContactModalOpen(true)} className="px-6 py-2.5 bg-[#ffd700] text-[#1a2744] rounded-lg hover:bg-[#ffd700]/90 transition font-semibold shadow-lg hover:shadow-xl">
                Contact
              </button>
            </div>
            {/* MOBILE NAV */}
            <div className="md:hidden flex gap-3 items-center">
              <button 
                onClick={() => setAuthModalOpen(true)} 
                className="text-gray-300 hover:text-[#ffd700] transition"
              >
                <LogIn className="w-5 h-5" />
              </button>
              <button onClick={() => setContactModalOpen(true)} className="px-4 py-2 bg-[#ffd700] text-[#1a2744] rounded-lg text-sm font-semibold">
                Contact
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1a2744] via-[#243352] to-[#2d3e5f] py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, #ffd700 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 bg-[#ffd700]/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-[#ffd700] mb-6 border border-[#ffd700]/30">
              <Sparkles className="w-4 h-4" />
              <span>Launching January 2026</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">
                Where Young Authors
              </span>
              <br />
              <span className="text-[#ffd700]">
                Are Born
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              The platform that makes your kids <span className="text-[#ffd700] font-semibold">excited to write</span>
            </p>

            <p className="text-lg text-gray-200 mb-10 max-w-2xl mx-auto">
              Your kids love ScratchJr and Minecraft. Now they'll love creating books. 
              <span className="font-semibold text-[#ffd700]"> Plus instant homework help</span> whenever they need it.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => setContactModalOpen(true)}
                className="px-8 py-4 bg-[#ffd700] text-[#1a2744] rounded-xl font-semibold hover:bg-[#ffd700]/90 inline-flex items-center gap-2 transition transform hover:scale-105 shadow-xl text-lg"
              >
                <Mail className="w-5 h-5" />
                Get Early Access
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 inline-flex items-center gap-2 transition border-2 border-[#ffd700]/30 text-lg"
              >
                Learn More
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd700] to-[#e6c200] border-2 border-[#1a2744]"></div>
                  ))}
                </div>
                <span className="text-gray-300">20 students publishing next week</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#ffd700] fill-[#ffd700]" />
                <span className="text-gray-300">Created by published author</span>
              </div>
            </div>

            {/* LOGIN REMINDER FOR BETA USERS */}
            <div className="mt-8">
              <p className="text-sm text-gray-400">
                Author Club member or beta tester?{' '}
                <button 
                  onClick={() => setAuthModalOpen(true)}
                  className="text-[#ffd700] hover:text-[#ffd700]/80 font-medium underline"
                >
                  Log in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#1a2744]">
              Sound Familiar?
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ffd700]/20 flex items-center justify-center">
                  <span className="text-[#1a2744] font-bold text-sm">✗</span>
                </div>
                <p className="text-gray-700">"My kid hates writing assignments"</p>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ffd700]/20 flex items-center justify-center">
                  <span className="text-[#1a2744] font-bold text-sm">✗</span>
                </div>
                <p className="text-gray-700">"They cry when it's homework time"</p>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ffd700]/20 flex items-center justify-center">
                  <span className="text-[#1a2744] font-bold text-sm">✗</span>
                </div>
                <p className="text-gray-700">"I don't know how to help with 4th grade math anymore"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-[#1a2744]">Everything Your Child Needs to</span>
              <br />
              <span className="text-[#ffd700]">Become a Confident Writer</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Plus the homework help you wish you had when you were a kid
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Book Creator */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-[#ffd700]/20 hover:border-[#ffd700]/50">
              <div className="w-16 h-16 bg-gradient-to-br from-[#ffd700] to-[#e6c200] rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <BookOpen className="w-8 h-8 text-[#1a2744]" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#1a2744]">Book Creator</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Kids create real books with text and pictures. They can add as many pages as they want, 
                illustrate their stories, and publish when they're ready.
              </p>
              <div className="flex items-center gap-2 text-sm text-[#ffd700] font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Makes writing feel like creating in Minecraft</span>
              </div>
            </div>

            {/* Writing Coach */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-[#ffd700]/20 hover:border-[#ffd700]/50">
              <div className="w-16 h-16 bg-gradient-to-br from-[#ffd700] to-[#e6c200] rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Sparkles className="w-8 h-8 text-[#1a2744]" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#1a2744]">Writing Coach</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                AI gives age-appropriate feedback on their stories. No more generic "good job!" - 
                real suggestions to help them improve, just like a teacher would.
              </p>
              <div className="flex items-center gap-2 text-sm text-[#ffd700] font-semibold">
                <Award className="w-4 h-4" />
                <span>Personalized to their grade level</span>
              </div>
            </div>

            {/* Homework Helper */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-[#ffd700]/20 hover:border-[#ffd700]/50">
              <div className="w-16 h-16 bg-gradient-to-br from-[#ffd700] to-[#e6c200] rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Camera className="w-8 h-8 text-[#1a2744]" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#1a2744]">Homework Helper</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Snap a photo of any homework problem. Get clear explanations that help them 
                understand, not just get the answer. Works for any subject.
              </p>
              <div className="flex items-center gap-2 text-sm text-[#ffd700] font-semibold">
                <Zap className="w-4 h-4" />
                <span>No more "I can't help with this"</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-[#1a2744]">
              Simple. Fun. Effective.
            </h2>
            <p className="text-xl text-gray-600">
              Your child will actually look forward to writing time
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#ffd700] rounded-full flex items-center justify-center text-3xl font-bold text-[#1a2744] mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1a2744]">Create</h3>
              <p className="text-gray-600">
                Start a new book. Add text and pictures to each page. It's as easy as drawing in their favorite app.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#ffd700] rounded-full flex items-center justify-center text-3xl font-bold text-[#1a2744] mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1a2744]">Get Feedback</h3>
              <p className="text-gray-600">
                AI coach gives them specific, encouraging suggestions. They learn and improve with every story.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#ffd700] rounded-full flex items-center justify-center text-3xl font-bold text-[#1a2744] mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1a2744]">Publish</h3>
              <p className="text-gray-600">
                Share their finished book with family and friends. Watch their confidence soar!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-[#1a2744] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-[#ffd700]">
                Created by a Teacher Who Gets It
              </span>
            </h2>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              As a <span className="font-semibold text-white">published children's book author</span> and <span className="font-semibold text-white">elementary teacher</span>, I've seen firsthand how traditional writing instruction fails to engage kids. I created LGA to make writing as exciting as their favorite games.
            </p>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              When my own kids started using the platform, I knew I had something special. Now I'm bringing it to families like yours.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-[#ffd700]/20">
                <div className="text-3xl font-bold text-[#ffd700] mb-2">20+</div>
                <div className="text-gray-300">Students launching next week</div>
              </div>
              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-[#ffd700]/20">
                <div className="text-3xl font-bold text-[#ffd700] mb-2">10+</div>
                <div className="text-gray-300">Years teaching experience</div>
              </div>
              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-[#ffd700]/20">
                <div className="text-3xl font-bold text-[#ffd700] mb-2">100%</div>
                <div className="text-gray-300">Engagement rate (kids love it!)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-[#1a2744]">
              Affordable for Every Family
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              We're finalizing pricing to make sure every family can afford to give their child this advantage. 
              Family plans available. Contact us for early access pricing.
            </p>
            <button 
              onClick={() => setContactModalOpen(true)}
              className="px-8 py-4 bg-[#ffd700] text-[#1a2744] rounded-xl font-semibold hover:bg-[#ffd700]/90 inline-flex items-center gap-2 transition transform hover:scale-105 shadow-xl text-lg"
            >
              <Mail className="w-5 h-5" />
              Get Early Access Pricing
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#1a2744] via-[#243352] to-[#2d3e5f] rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, #ffd700 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Transform Your Child's Writing?
              </h2>
              <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
                Join families who are giving their kids the gift of confident, creative writing. 
                Plus homework help whenever they need it. Launching January 2026.
              </p>
              <button 
                onClick={() => setContactModalOpen(true)}
                className="px-8 py-4 bg-[#ffd700] text-[#1a2744] rounded-xl font-semibold hover:bg-[#ffd700]/90 inline-flex items-center gap-2 transition transform hover:scale-105 shadow-xl text-lg"
              >
                <Mail className="w-5 h-5" />
                Contact Brandon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a2744] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6 text-[#ffd700]" />
                <span className="font-bold">Literary Genius</span>
              </div>
              <p className="text-gray-400 text-sm">Where Young Authors Are Born</p>
              <p className="text-gray-400 text-sm mt-2">Launching January 2026</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-[#ffd700]">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-[#ffd700] transition">Features</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-[#ffd700] transition">About</button></li>
                <li><button onClick={() => setContactModalOpen(true)} className="hover:text-[#ffd700] transition">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-[#ffd700]">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-[#ffd700] transition">About Brandon</button></li>
                <li><button onClick={() => setContactModalOpen(true)} className="hover:text-[#ffd700] transition">Contact</button></li>
                <li><button onClick={() => setAuthModalOpen(true)} className="hover:text-[#ffd700] transition">Login</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-[#ffd700]">Connect</h3>
              <button 
                onClick={() => setContactModalOpen(true)}
                className="px-4 py-2 bg-[#ffd700] text-[#1a2744] rounded-lg hover:bg-[#ffd700]/90 transition text-sm font-semibold"
              >
                Get in Touch
              </button>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Literary Genius Academy. All rights reserved.</p>
            <p className="mt-2">Created with <Heart className="w-4 h-4 inline text-[#ffd700]" /> by Brandon Mayes</p>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setContactModalOpen(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#1a2744]">Get in Touch</h3>
              <button onClick={() => setContactModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#1a2744]/10 to-[#ffd700]/10 p-6 rounded-xl border-2 border-[#ffd700]/30">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="w-6 h-6 text-[#1a2744]" />
                  <span className="font-semibold text-gray-900">Email Brandon</span>
                </div>
                <a href="mailto:BrandonT.Mayes@gmail.com" className="text-[#1a2744] hover:text-[#ffd700] font-medium text-lg">
                  BrandonT.Mayes@gmail.com
                </a>
              </div>
              <p className="text-gray-600 text-sm">
                Interested in early access? Have questions? Want to schedule a demo? 
                Drop me an email and I'll get back to you within 24 hours!
              </p>
              <p className="text-gray-700 font-medium">
                🎄 At Kellie's Christmas party? Ask her to introduce us!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  )
}
