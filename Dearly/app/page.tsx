'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f1ea' }}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-lg transition-all ${isScrolled ? 'bg-[#f4f1ea]/80 border-b border-[#0b4e9d]/10' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-2">
          <nav className="flex justify-between items-center">
            <div className="flex items-center gap-2 group cursor-pointer">
              <Image
                src="/Dearly Extra.png"
                alt="Dearly Logo"
                width={70}
                height={27}
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <Link
              href="/login"
              className="text-sm font-medium hover:opacity-70 transition-all duration-300 hover:translate-x-1"
              style={{ color: '#0b4e9d' }}
            >
              Admin Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-24 relative">
        {/* Heart image - moved up and left with slight clockwise rotation */}
        <div className="absolute bottom-40 right-48 md:right-56 transition-transform duration-300 hover:scale-110" style={{ transform: 'rotate(15deg)' }}>
          <Image src="/heart.png" alt="" width={120} height={120} />
        </div>

        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <h2 className="permanent-marker text-5xl md:text-6xl lg:text-7xl mb-8 md:mb-12 leading-tight" style={{ color: '#0b4e9d' }}>
            PRESERVE YOUR STORIES
          </h2>
          <Link href="/checkout">
            <button className="px-10 py-3 md:px-12 md:py-3 rounded-full text-white font-semibold hover:opacity-90 transition-all duration-300 shadow-lg text-lg hover:shadow-2xl hover:scale-105 mb-12 md:mb-16 flex items-center justify-center" style={{ backgroundColor: '#0b4e9d' }}>
              Book an interview
            </button>
          </Link>
        </div>
      </section>

      {/* Feature Section 1 - Problem/Solution */}
      <section className="container mx-auto px-6 py-16 md:py-24 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="transition-transform duration-300 hover:scale-110">
              <Image src="/mic.png" alt="" width={120} height={120} />
            </div>
          </div>
          <h3 className="permanent-marker text-3xl md:text-4xl lg:text-5xl mb-8 leading-tight" style={{ color: '#0b4e9d' }}>
            The best way to keep your family legacy
          </h3>
          <p className="text-lg md:text-xl mb-12 opacity-80" style={{ color: '#0b4e9d' }}>
            We provide professional guidance in edited interviews.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer">
              <h4 className="text-xl font-bold mb-3 pb-2 transition-colors duration-300 inline-block border-b-4" style={{ color: '#0b4e9d', borderColor: '#0b4e9d' }}>
                Professional Audio Recordings
              </h4>
              <p className="opacity-70" style={{ color: '#0b4e9d' }}>
                High-quality, edited interviews capturing every precious word, laugh, and story to listen to forever.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer">
              <h4 className="text-xl font-bold mb-3 pb-2 transition-colors duration-300 inline-block border-b-4" style={{ color: '#0b4e9d', borderColor: '#0b4e9d' }}>
                Written Memoirs
              </h4>
              <p className="opacity-70" style={{ color: '#0b4e9d' }}>
                Transform your interview into a beautifully crafted written memoir to share with generations.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer">
              <h4 className="text-xl font-bold mb-3 pb-2 transition-colors duration-300 inline-block border-b-4" style={{ color: '#0b4e9d', borderColor: '#0b4e9d' }}>
                Complete Transcripts
              </h4>
              <p className="opacity-70" style={{ color: '#0b4e9d' }}>
                Full written transcripts of every conversation, making it easy to search and reference specific stories.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer">
              <h4 className="text-xl font-bold mb-3 pb-2 transition-colors duration-300 inline-block border-b-4" style={{ color: '#0b4e9d', borderColor: '#0b4e9d' }}>
                Family Tree Integration
              </h4>
              <p className="opacity-70" style={{ color: '#0b4e9d' }}>
                Connect stories to your family tree, preserving context and relationships for future generations.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Link href="/checkout">
              <button className="px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-all duration-300 text-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 flex items-center justify-center" style={{ backgroundColor: '#0b4e9d' }}>
                Book Your Interview
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section 2 - Reversed */}
      <section className="container mx-auto px-6 py-16 md:py-24 relative">
        {/* Hug image - on website background, larger and more left */}
        <div className="absolute top-[45%] right-0 md:right-32 transform -translate-y-1/2 transition-transform duration-300 hover:scale-110">
          <Image src="/hug.png" alt="" width={250} height={250} />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="order-2 md:order-1">
            <h3 className="permanent-marker text-3xl md:text-4xl mb-6 leading-tight" style={{ color: '#0b4e9d' }}>
              Every conversation is expertly guided and professionally produced
            </h3>
            <p className="text-lg mb-6 opacity-80" style={{ color: '#0b4e9d' }}>
              We handle scheduling, recording, and editing so you can focus on what matters, preserving their story.
            </p>
          </div>
          <div className="order-1 md:order-2 relative">
            {/* Removed background container */}
          </div>
        </div>
      </section>

      {/* Arrow Between Section 2 and 3 */}
      <div className="container mx-auto px-6 flex justify-center -my-12">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'scaleX(-1)' }}>
          <path d="M 30 20 Q 80 50 60 100" stroke="#0b4e9d" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <path d="M 60 100 L 52 90 M 60 100 L 68 90" stroke="#0b4e9d" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Feature Section 3 */}
      <section className="container mx-auto px-6 py-16 md:py-24 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="relative">
            <div className="relative mx-auto w-64 h-[500px] rounded-[3rem] border-8 border-black overflow-hidden shadow-2xl" style={{ backgroundColor: '#fff' }}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl"></div>
              <div className="p-6 text-center mt-8 flex flex-col h-[calc(100%-2rem)]">
                <div className="text-sm font-semibold mb-6" style={{ color: '#0b4e9d' }}>Grandma's Stories</div>

                {/* Audio Player Container */}
                <div className="flex-1 flex flex-col justify-center px-2">
                  <div className="bg-white rounded-2xl p-6 shadow-lg" style={{ backgroundColor: '#f4f1ea' }}>
                    {/* Waveform Visual */}
                    <div className="flex items-center justify-center gap-1 mb-6 h-24">
                      {[45, 65, 30, 75, 55, 40, 70, 35, 60, 80, 50, 45, 65, 55, 40, 70, 60, 50, 75, 55].map((height, i) => (
                        <div
                          key={i}
                          className="w-1 rounded-full transition-all"
                          style={{
                            backgroundColor: '#0b4e9d',
                            height: `${height}%`,
                            opacity: 0.7
                          }}
                        />
                      ))}
                    </div>

                    {/* Audio Player */}
                    <audio
                      controls
                      className="w-full"
                      style={{
                        height: '40px',
                        borderRadius: '20px'
                      }}
                    >
                      <source src="/sample-story.mp3" type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>

                    {/* Story Title */}
                    <div className="mt-4 text-xs font-medium" style={{ color: '#0b4e9d' }}>
                      "My First Day in America"
                    </div>
                    <div className="text-xs opacity-60" style={{ color: '#0b4e9d' }}>
                      2:34
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
              <div>
            <h3 className="permanent-marker text-3xl md:text-4xl mb-6 leading-tight" style={{ color: '#0b4e9d' }}>
              Receive a timeless memory you&apos;ll treasure forever
            </h3>
            <p className="text-lg mb-6 opacity-80" style={{ color: '#0b4e9d' }}>
              Within 5–7 business days, you will receive your audio gift, with everything you&apos;d want to keep captured to perfection.
            </p>
          </div>
        </div>
      </section>

      {/* Arrow Between Section 3 and 4 */}
      <div className="container mx-auto px-6 flex justify-center -my-12">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 30 20 Q 50 40 60 100" stroke="#0b4e9d" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <path d="M 60 100 L 52 90 M 60 100 L 68 90" stroke="#0b4e9d" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Feature Section 4 - Pricing */}
      <section className="container mx-auto px-6 py-16 md:py-24 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-6 mb-6">
              <h3 className="permanent-marker text-3xl md:text-4xl lg:text-5xl leading-tight" style={{ color: '#0b4e9d' }}>
                Choose your Dearly plan
              </h3>
              <div className="transition-transform duration-300 hover:scale-110">
                <Image src="/smile.png" alt="" width={80} height={80} />
              </div>
            </div>
            <p className="text-lg md:text-xl mb-8 opacity-80 max-w-3xl mx-auto" style={{ color: '#0b4e9d' }}>
              Select from our different plans. All include a 60-minute session with a caring, well-trained interviewer, high-quality audio recording, and professional editing.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {/* Dearly Essential */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-2">
              <div className="text-center mb-6">
                <h4 className="text-3xl font-semibold mb-2" style={{ color: '#0b4e9d' }}>Dearly Essential</h4>
                <div className="text-5xl font-bold mb-2" style={{ color: '#0b4e9d' }}>$99</div>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#0b4e9d' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#0b4e9d' }}>1-hour guided audio interview (remote)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#0b4e9d' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#0b4e9d' }}>Edited audio with music</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#0b4e9d' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#0b4e9d' }}>Delivered digitally</span>
                </li>
              </ul>
              <Link href="/checkout">
                <button className="w-full px-6 py-3 rounded-full font-semibold transition-all duration-300 border-2 hover:shadow-lg hover:scale-105 hover:-translate-y-1 flex items-center justify-center" style={{ borderColor: '#0b4e9d', color: '#0b4e9d', backgroundColor: 'transparent' }}>
                  Get Started
                </button>
              </Link>
            </div>

            {/* Dearly Gift - Popular */}
            <div className="bg-white rounded-3xl p-8 shadow-xl relative border-4 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-3" style={{ borderColor: '#0b4e9d' }}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: '#0b4e9d' }}>
                MOST POPULAR
              </div>
              <div className="text-center mb-6">
                <h4 className="text-3xl font-semibold mb-2" style={{ color: '#0b4e9d' }}>Dearly Gift</h4>
                <div className="text-5xl font-bold mb-2" style={{ color: '#0b4e9d' }}>$139</div>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#0b4e9d' }}>✓</span>
                  <span className="text-sm font-semibold opacity-80" style={{ color: '#0b4e9d' }}>Everything in Essential +</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#0b4e9d' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#0b4e9d' }}>Full polished transcript</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#0b4e9d' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#0b4e9d' }}>AI-generated mini biography</span>
                </li>
              </ul>
              <Link href="/checkout">
                <button className="w-full px-6 py-3 rounded-full text-white font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 flex items-center justify-center" style={{ backgroundColor: '#0b4e9d' }}>
                  Get Started
                </button>
              </Link>
            </div>

            {/* Dearly Legacy */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-2">
              <div className="text-center mb-6">
                <h4 className="text-3xl font-semibold mb-2" style={{ color: '#0b4e9d' }}>Dearly Legacy</h4>
                <div className="text-5xl font-bold mb-2" style={{ color: '#0b4e9d' }}>$199</div>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#0b4e9d' }}>✓</span>
                  <span className="text-sm font-semibold opacity-80" style={{ color: '#0b4e9d' }}>Everything in Gift +</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#0b4e9d' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#0b4e9d' }}>Free interview for another family member</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#0b4e9d' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#0b4e9d' }}>Early access to downloadable family e-book (PDF) after 3 family interviews</span>
                </li>
              </ul>
              <Link href="/checkout">
                <button className="w-full px-6 py-3 rounded-full font-semibold transition-all duration-300 border-2 hover:shadow-lg hover:scale-105 hover:-translate-y-1 flex items-center justify-center" style={{ borderColor: '#0b4e9d', color: '#0b4e9d', backgroundColor: 'transparent' }}>
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <h3 className="permanent-marker text-3xl md:text-4xl text-center mb-4" style={{ color: '#0b4e9d' }}>
          Little Love Notes from Dearly Users ❤️
        </h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer">
            <p className="text-sm mb-4 italic" style={{ color: '#0b4e9d' }}>
              &quot;This was the best gift I&apos;ve ever given. My grandmother shared stories I&apos;d never heard before. Absolutely priceless.&quot;
            </p>
            <p className="text-xs font-semibold" style={{ color: '#0b4e9d' }}>— Sarah M.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer">
            <p className="text-sm mb-4 italic" style={{ color: '#0b4e9d' }}>
              &quot;The interviewer was so professional and made my dad feel comfortable. We now have his WWII stories preserved forever.&quot;
            </p>
            <p className="text-xs font-semibold" style={{ color: '#0b4e9d' }}>— Michael T.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer">
            <p className="text-sm mb-4 italic" style={{ color: '#0b4e9d' }}>
              &quot;I wish I had done this sooner. The quality is amazing and the process was so easy. Highly recommend!&quot;
            </p>
            <p className="text-xs font-semibold" style={{ color: '#0b4e9d' }}>— Jennifer L.</p>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="container mx-auto px-6 py-16 md:py-24 relative">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="transition-transform duration-300 hover:scale-110">
              <Image src="/hands.png" alt="" width={120} height={120} />
            </div>
          </div>
          <h3 className="permanent-marker text-4xl md:text-5xl mb-6" style={{ color: '#0b4e9d' }}>
            Start preserving memories today
          </h3>
          <div className="flex justify-center mb-4">
            <Link href="/checkout">
              <button className="px-8 py-3 rounded-full text-white font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 flex items-center justify-center" style={{ backgroundColor: '#0b4e9d' }}>
                Book Your Interview
              </button>
            </Link>
          </div>
          <p className="text-sm opacity-60" style={{ color: '#0b4e9d' }}>
            Simple booking • Professional results • Memories that last forever
                </p>
              </div>
      </section>

      {/* Food for Thought / Final CTA Section */}
      <section className="container mx-auto px-6 py-16 md:py-24 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="relative h-96 flex items-center justify-center">
            <div className="transition-transform duration-300 hover:scale-110">
              <Image src="/mail.png" alt="" width={180} height={180} />
            </div>
          </div>
          <div>
            <h3 className="permanent-marker text-3xl md:text-4xl mb-6" style={{ color: '#0b4e9d' }}>
              A moment to reflect
            </h3>
            <p className="text-lg mb-4 opacity-80" style={{ color: '#0b4e9d' }}>
              When was the last time you asked your loved ones about their childhood? Their first love? The moments that changed everything?
            </p>
            <p className="text-lg mb-6 opacity-80" style={{ color: '#0b4e9d' }}>
              These conversations won&apos;t happen on their own. Make time for what matters before time runs out.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-3 rounded-full border-2 focus:outline-none focus:border-opacity-100 transition-all duration-300 flex items-center"
                style={{
                  borderColor: '#0b4e9d',
                  color: '#0b4e9d'
                }}
              />
              <button
                type="submit"
                className="px-8 py-3 rounded-full text-white font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 whitespace-nowrap flex items-center justify-center"
                style={{ backgroundColor: '#0b4e9d' }}
              >
                Stay Updated
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 mt-24" style={{ backgroundColor: '#0b4e9d' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* About Us and Social Media Side by Side */}
            <div className="grid md:grid-cols-2 gap-12 mb-12">
              {/* About Us Section */}
              <div>
                <h4 className="text-2xl font-semibold mb-4 text-white">About Dearly</h4>
                <p className="text-white opacity-90 leading-relaxed mb-4">
                  We&apos;re two college roommates who lived far from home, carrying our families with us through calls, memories, and the sound of their voices.
                </p>
                <p className="text-white opacity-90 leading-relaxed mb-4">
                  Using our skills in storytelling and technology, we set out to build a service that preserves what truly matters: the voice, the personality, the life behind every memory.
                </p>
                <p className="text-white opacity-90 leading-relaxed mb-4">
                  We believe no family story should disappear. Technology can takes us really far… but it takes humans, intention and care to preserve the soul of someone&apos;s life.
                </p>
                <p className="text-white opacity-90 leading-relaxed italic">
                  Dearly,<br />
                  Justin & Jose
                </p>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="text-xl font-semibold mb-4 text-white">Follow Us</h4>
                <ul className="flex flex-col gap-3 text-white opacity-80">
                  <li><Link href="#" className="hover:opacity-100 transition-opacity">Twitter</Link></li>
                  <li><Link href="#" className="hover:opacity-100 transition-opacity">Instagram</Link></li>
                  <li><Link href="#" className="hover:opacity-100 transition-opacity">Facebook</Link></li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-white border-opacity-20 pt-8 text-center text-white opacity-60 text-sm">
              <p>&copy; 2025 Dearly. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
