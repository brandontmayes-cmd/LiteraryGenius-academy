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
      <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur-sm"></div>
                <div className="relative h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Literary Genius Academy
                </div>
                <div className="text-xs text-gray-600">Where Young Authors Are Born</div>
              </div>
            </div>
            <div className="hidden md:flex gap-8 items-center">
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-purple-600 transition font-medium">Features</button>
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-purple-600 transition font-medium">About</button>
              {/* SUBTLE LOGIN */}
              <button 
                onClick={() => setAuthModalOpen(true)} 
                className="text-gray-600 hover:text-purple-600 transition text-sm flex items-center gap-1"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>        
              <button onClick={() => setContactModalOpen(true)} className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold shadow-lg hover:shadow-xl">
                Contact
              </button>
            </div>
            {/* MOBILE NAV */}
            <div className="md:hidden flex gap-3 items-center">
              <button 
                onClick={() => setAuthModalOpen(true)} 
                className="text-gray-600 hover:text-purple-600 transition"
              >
                <LogIn className="w-5 h-5" />
              </button>
              <button onClick={() => setContactModalOpen(true)} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold">
                Contact
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-purple/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full text-sm font-semibold text-purple-700 mb-6 border border-purple-200">
              <Sparkles className="w-4 h-4" />
              <span>Launching January 2026</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                Where Young Authors
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                Are Born
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              The platform that makes your kids <span className="text-purple-600 font-semibold">excited to write</span>
            </p>

            <p className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
              Your kids love ScratchJr and Minecraft. Now they'll love creating books. 
              <span className="font-semibold text-purple-600"> Plus instant homework help</span> whenever they need it.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => setContactModalOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 inline-flex items-center gap-2 transition transform hover:scale-105 shadow-xl text-lg"
              >
                <Mail className="w-5 h-5" />
                Get Early Access
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-50 inline-flex items-center gap-2 transition border-2 border-purple-200 text-lg"
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
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white"></div>
                  ))}
                </div>
                <span className="text-gray-600">20 students publishing next week</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-gray-600">Created by published author</span>
              </div>
            </div>

            {/* LOGIN REMINDER FOR BETA USERS */}
            <div className="mt-8">
              <p className="text-sm text-gray-500">
                Author Club member or beta tester?{' '}
                <button 
                  onClick={() => setAuthModalOpen(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium underline"
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Sound Familiar?
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl">😤</div>
                <div>
                  <p className="text-gray-700 font-medium">Your child struggles with writing assignments</p>
                  <p className="text-gray-600 text-sm">They'd rather do anything else</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl">😰</div>
                <div>
                  <p className="text-gray-700 font-medium">Homework battles every night</p>
                  <p className="text-gray-600 text-sm">You're exhausted after long shifts and can't help</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl">😔</div>
                <div>
                  <p className="text-gray-700 font-medium">They lack confidence in their abilities</p>
                  <p className="text-gray-600 text-sm">"I'm not good at writing" becomes their identity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Make Writing as Fun as Their Favorite Games
              </span>
            </h2>
            <p className="text-xl text-gray-700">
              LGA turns reluctant writers into eager authors. Kids don't realize they're learning—they just want to create. 
              <span className="font-semibold text-purple-600"> And homework help is always available</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Features - 4 CARDS! */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Everything Your Child Needs
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group p-8 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-xl">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Book Creator</h3>
              <p className="text-gray-600 mb-4">
                They pick the story, add pictures, publish it. Like ScratchJr, but for books.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span>25+ writing prompts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span>Upload photos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span>Publish instantly</span>
                </li>
              </ul>
            </div>

            <div className="group p-8 bg-white rounded-2xl border-2 border-pink-100 hover:border-pink-300 transition-all hover:shadow-xl">
              <div className="bg-gradient-to-br from-pink-400 to-rose-600 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">AI Writing Coach</h3>
              <p className="text-gray-600 mb-4">
                24/7 help that never gets frustrated. Age-appropriate feedback for grades 3-5.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-pink-600" />
                  <span>Story brainstorming</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-pink-600" />
                  <span>Character development</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-pink-600" />
                  <span>Positive feedback</span>
                </li>
              </ul>
            </div>

            {/* HOMEWORK HELPER - HIGHLIGHTED! */}
            <div className="group p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-300 hover:border-green-400 transition-all hover:shadow-xl relative">
              <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                PARENTS LOVE THIS
              </div>
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Homework Helper</h3>
              <p className="text-gray-600 mb-4 font-medium">
                <span className="text-green-700">Snap a photo, get instant help.</span> No more homework battles!
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span>Photo upload for any subject</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span>Clear explanations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span>Available 24/7</span>
                </li>
              </ul>
            </div>

            <div className="group p-8 bg-white rounded-2xl border-2 border-rose-100 hover:border-rose-300 transition-all hover:shadow-xl">
              <div className="bg-gradient-to-br from-rose-400 to-orange-600 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Author Portfolio</h3>
              <p className="text-gray-600 mb-4">
                Watch their confidence grow with every book they publish.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-rose-600" />
                  <span>Personal library</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-rose-600" />
                  <span>Share with family</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-rose-600" />
                  <span>Track progress</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Homework Helper Callout */}
          <div className="mt-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center shadow-xl">
            <Camera className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">Homework Battles? Over.</h3>
            <p className="text-lg mb-4 opacity-90 max-w-2xl mx-auto">
              Coming home exhausted from your shift? Your child can snap a photo of their homework and get instant, clear explanations. 
              No more stress. No more fights. Just learning.
            </p>
            <p className="text-sm opacity-80">
              Works for math, reading, science, social studies—any subject!
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-full">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Author Club Launch</h3>
                  <p className="text-gray-600">McKinney, Texas</p>
                </div>
              </div>
              <p className="text-lg text-gray-700 mb-6">
                "I tested this with my own daughter (9 years old). She spent 30 minutes creating her first book page <span className="font-semibold text-purple-600">without me asking</span>. When kids create voluntarily, you know you've built something special."
              </p>
              <p className="text-lg text-gray-700 mb-6">
                "We're launching with 20 students next week. They're <span className="font-semibold text-purple-600">chomping at the bit</span> to get started. Every single one will publish their first book."
              </p>
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"></div>
                <div>
                  <div className="font-bold text-gray-900">Brandon Mayes</div>
                  <div className="text-gray-600">Published Children's Book Author & Elementary Teacher</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Built by Someone Who Gets It
              </span>
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              As a <span className="font-semibold">published children's book author</span> and <span className="font-semibold">elementary teacher</span>, I've seen firsthand how traditional writing instruction fails to engage kids. I created LGA to make writing as exciting as their favorite games.
            </p>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              When my own kids started using the platform, I knew I had something special. Now I'm bringing it to families like yours.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 mb-2">20+</div>
                <div className="text-gray-700">Students launching next week</div>
              </div>
              <div className="p-6 bg-pink-50 rounded-xl">
                <div className="text-3xl font-bold text-pink-600 mb-2">10+</div>
                <div className="text-gray-700">Years teaching experience</div>
              </div>
              <div className="p-6 bg-rose-50 rounded-xl">
                <div className="text-3xl font-bold text-rose-600 mb-2">100%</div>
                <div className="text-gray-700">Engagement rate (kids love it!)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Affordable for Every Family
              </span>
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              We're finalizing pricing to make sure every family can afford to give their child this advantage. 
              Family plans available. Contact us for early access pricing.
            </p>
            <button 
              onClick={() => setContactModalOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 inline-flex items-center gap-2 transition transform hover:scale-105 shadow-xl text-lg"
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
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Child's Writing?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join families who are giving their kids the gift of confident, creative writing. 
              Plus homework help whenever they need it. Launching January 2026.
            </p>
            <button 
              onClick={() => setContactModalOpen(true)}
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-50 inline-flex items-center gap-2 transition transform hover:scale-105 shadow-xl text-lg"
            >
              <Mail className="w-5 h-5" />
              Contact Brandon
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
              <p className="text-gray-400 text-sm">Where Young Authors Are Born</p>
              <p className="text-gray-400 text-sm mt-2">Launching January 2026</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition">Features</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition">About</button></li>
                <li><button onClick={() => setContactModalOpen(true)} className="hover:text-white transition">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition">About Brandon</button></li>
                <li><button onClick={() => setContactModalOpen(true)} className="hover:text-white transition">Contact</button></li>
                <li><button onClick={() => setAuthModalOpen(true)} className="hover:text-white transition">Login</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <button 
                onClick={() => setContactModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition text-sm font-semibold"
              >
                Get in Touch
              </button>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Literary Genius Academy. All rights reserved.</p>
            <p className="mt-2">Created with <Heart className="w-4 h-4 inline text-red-500" /> by Brandon Mayes</p>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setContactModalOpen(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Get in Touch</h3>
              <button onClick={() => setContactModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="w-6 h-6 text-purple-600" />
                  <span className="font-semibold text-gray-900">Email Brandon</span>
                </div>
                <a href="mailto:BrandonT.Mayes@gmail.com" className="text-purple-600 hover:text-purple-700 font-medium text-lg">
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
