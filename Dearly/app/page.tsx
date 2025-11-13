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
    <div className="min-h-screen" style={{ backgroundColor: '#F2EEE9' }}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-lg transition-all ${isScrolled ? 'bg-[#F2EEE9]/80 border-b border-[#1A0089]/10' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-6">
          <nav className="flex justify-between items-center">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" style={{ backgroundColor: '#1A0089' }}></div>
              <h1 className="text-2xl font-bold font-serif transition-all duration-300 group-hover:tracking-wider" style={{ color: '#1A0089' }}>Dearly,</h1>
            </div>
            <Link
              href="/login"
              className="text-sm font-medium hover:opacity-70 transition-all duration-300 hover:translate-x-1"
              style={{ color: '#1A0089' }}
            >
              Admin Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6">
        <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] rounded-3xl overflow-hidden">
          {/* Background Image */}
          <Image
            src="/hero.png"
            alt="Family gathering"
            fill
            className="object-cover"
            priority
          />

          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>

          {/* Text Overlay - Bottom left, full width */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full px-8 md:px-16 lg:px-20 pb-8 md:pb-12 lg:pb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-4 md:mb-6 leading-tight text-white drop-shadow-lg">
                Preserve your stories
              </h2>
              <p className="text-md md:text-lg lg:text-xl mb-6 md:mb-8 text-white/90 drop-shadow-md">
                Captures the voice and life story of your loved ones.
              </p>
              <Link href="/checkout">
                <button className="px-8 py-3 md:px-10 md:py-4 rounded-full text-white font-semibold hover:opacity-90 transition-all duration-300 shadow-lg text-lg hover:shadow-2xl hover:scale-105 hover:-translate-y-1" style={{ backgroundColor: '#1A0089' }}>
                  Book Your Interview
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 1 - Problem/Solution */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-8 leading-tight" style={{ color: '#1A0089' }}>
            There&apos;s no easy way to keep a family legacy before it&apos;s gone
          </h3>
          <p className="text-lg md:text-xl mb-12 opacity-80" style={{ color: '#1A0089' }}>
            We provide professional, guided, and edited interviews for you to listen to forever.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" style={{ backgroundColor: '#B7CF3F' }}>
                🎙️
              </div>
              <h4 className="text-xl font-bold mb-3 transition-colors duration-300" style={{ color: '#1A0089' }}>
                Professional Audio Recordings
              </h4>
              <p className="opacity-70" style={{ color: '#1A0089' }}>
                High-quality, edited interviews capturing every precious word, laugh, and story to listen to forever.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" style={{ backgroundColor: '#FF5E33' }}>
                📖
              </div>
              <h4 className="text-xl font-bold mb-3 transition-colors duration-300" style={{ color: '#1A0089' }}>
                Written Memoirs
              </h4>
              <p className="opacity-70" style={{ color: '#1A0089' }}>
                Transform your interview into a beautifully crafted written memoir to share with generations.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" style={{ backgroundColor: '#FF5E33' }}>
                📝
              </div>
              <h4 className="text-xl font-bold mb-3 transition-colors duration-300" style={{ color: '#1A0089' }}>
                Complete Transcripts
              </h4>
              <p className="opacity-70" style={{ color: '#1A0089' }}>
                Full written transcripts of every conversation, making it easy to search and reference specific stories.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" style={{ backgroundColor: '#B7CF3F' }}>
                🌳
              </div>
              <h4 className="text-xl font-bold mb-3 transition-colors duration-300" style={{ color: '#1A0089' }}>
                Family Tree Integration
              </h4>
              <p className="opacity-70" style={{ color: '#1A0089' }}>
                Connect stories to your family tree, preserving context and relationships for future generations.
              </p>
            </div>
          </div>

          <Link href="/checkout">
            <button className="px-8 py-4 rounded-full text-white font-semibold hover:opacity-90 transition-all duration-300 text-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1" style={{ backgroundColor: '#1A0089' }}>
              Book Your Interview
            </button>
          </Link>
        </div>
      </section>

      {/* Feature Section 2 - Reversed */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="order-2 md:order-1">
            <h3 className="text-3xl md:text-4xl font-bold font-serif mb-6 leading-tight" style={{ color: '#1A0089' }}>
              Every conversation is expertly guided and professionally produced
            </h3>
            <p className="text-lg mb-6 opacity-80" style={{ color: '#1A0089' }}>
              Our trained interviewers know how to ask the right questions at the right time. We handle scheduling, recording, and editing so you can focus on what matters—preserving their story.
            </p>
          </div>
          <div className="order-1 md:order-2 relative">
            <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-xl">
              <Image
                src="/section2.jpeg"
                alt="Professional interview"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Arrow Between Section 2 and 3 */}
      <div className="container mx-auto px-6 flex justify-center -my-12">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'scaleX(-1)' }}>
          <path d="M 30 20 Q 80 50 60 100" stroke="#FF5E33" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <path d="M 60 100 L 52 90 M 60 100 L 68 90" stroke="#FF5E33" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Feature Section 3 */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="relative">
            <div className="relative mx-auto w-64 h-[500px] rounded-[3rem] border-8 border-black overflow-hidden shadow-2xl" style={{ backgroundColor: '#fff' }}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl"></div>
              <div className="p-6 text-center mt-8 flex flex-col h-[calc(100%-2rem)]">
                <div className="text-sm font-semibold mb-6" style={{ color: '#1A0089' }}>Grandma's Stories</div>

                {/* Audio Player Container */}
                <div className="flex-1 flex flex-col justify-center px-2">
                  <div className="bg-white rounded-2xl p-6 shadow-lg" style={{ backgroundColor: '#F2EEE9' }}>
                    {/* Waveform Visual */}
                    <div className="flex items-center justify-center gap-1 mb-6 h-24">
                      {[45, 65, 30, 75, 55, 40, 70, 35, 60, 80, 50, 45, 65, 55, 40, 70, 60, 50, 75, 55].map((height, i) => (
                        <div
                          key={i}
                          className="w-1 rounded-full transition-all"
                          style={{
                            backgroundColor: '#1A0089',
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
                    <div className="mt-4 text-xs font-medium" style={{ color: '#1A0089' }}>
                      "My First Day in America"
                    </div>
                    <div className="text-xs opacity-60" style={{ color: '#1A0089' }}>
                      2:34
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
              <div>
            <h3 className="text-3xl md:text-4xl font-bold font-serif mb-6 leading-tight" style={{ color: '#1A0089' }}>
              Receive a timeless keepsake you&apos;ll treasure forever
            </h3>
            <p className="text-lg mb-6 opacity-80" style={{ color: '#1A0089' }}>
              Within 5-7 business days, receive your professionally edited recording. High-quality audio that captures every precious word, laugh, and memory—ready to share with family or keep close to your heart.
            </p>
            <div className="flex gap-3 mb-6">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#B7CF3F' }}>
                <span className="text-xl">✓</span>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#96ADD9' }}>
                <span className="text-xl">✓</span>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#B7CF3F' }}>
                <span className="text-xl">✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Arrow Between Section 3 and 4 */}
      <div className="container mx-auto px-6 flex justify-center -my-12">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 30 20 Q 50 40 60 100" stroke="#FF5E33" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <path d="M 60 100 L 52 90 M 60 100 L 68 90" stroke="#FF5E33" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Feature Section 4 - Pricing */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-6 leading-tight" style={{ color: '#1A0089' }}>
              Choose the session that fits your story
            </h3>
            <p className="text-lg md:text-xl mb-8 opacity-80 max-w-3xl mx-auto" style={{ color: '#1A0089' }}>
              Select from 30, 60, or 90-minute sessions. Perfect for capturing key memories or comprehensive life histories. Every package includes professional interviewing, recording, and editing.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {/* 30 Minute Package */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-2">
              <div className="text-center mb-6">
                <div className="inline-block px-4 py-2 rounded-full mb-4" style={{ backgroundColor: '#B7CF3F' }}>
                  <span className="text-sm font-semibold" style={{ color: '#1A0089' }}>STARTER</span>
                </div>
                <h4 className="text-3xl font-bold font-serif mb-2" style={{ color: '#1A0089' }}>30 Minutes</h4>
                <div className="text-5xl font-bold mb-2" style={{ color: '#1A0089' }}>$120</div>
                <p className="text-sm opacity-60" style={{ color: '#1A0089' }}>Perfect for key highlights</p>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#B7CF3F' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#1A0089' }}>Professional interviewer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#B7CF3F' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#1A0089' }}>High-quality recording</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#B7CF3F' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#1A0089' }}>Professional editing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#B7CF3F' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#1A0089' }}>Delivered in 5-7 days</span>
                </li>
              </ul>
              <Link href="/checkout">
                <button className="w-full px-6 py-3 rounded-full font-semibold transition-all duration-300 border-2 hover:shadow-lg hover:scale-105 hover:-translate-y-1" style={{ borderColor: '#1A0089', color: '#1A0089', backgroundColor: 'transparent' }}>
                  Get Started
                </button>
              </Link>
            </div>

            {/* 60 Minute Package - Popular */}
            <div className="bg-white rounded-3xl p-8 shadow-xl relative border-4 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-3" style={{ borderColor: '#1A0089' }}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: '#FF5E33' }}>
                MOST POPULAR
              </div>
              <div className="text-center mb-6">
                <div className="inline-block px-4 py-2 rounded-full mb-4" style={{ backgroundColor: '#96ADD9' }}>
                  <span className="text-sm font-semibold" style={{ color: '#1A0089' }}>CLASSIC</span>
                </div>
                <h4 className="text-3xl font-bold font-serif mb-2" style={{ color: '#1A0089' }}>60 Minutes</h4>
                <div className="text-5xl font-bold mb-2" style={{ color: '#1A0089' }}>$150</div>
                <p className="text-sm opacity-60" style={{ color: '#1A0089' }}>Our most popular choice</p>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#96ADD9' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#1A0089' }}>Professional interviewer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#96ADD9' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#1A0089' }}>High-quality recording</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#96ADD9' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#1A0089' }}>Professional editing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#96ADD9' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#1A0089' }}>Delivered in 5-7 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#96ADD9' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#1A0089' }}>Full transcript included</span>
                </li>
              </ul>
              <Link href="/checkout">
                <button className="w-full px-6 py-3 rounded-full text-white font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1" style={{ backgroundColor: '#1A0089' }}>
                  Get Started
                </button>
              </Link>
            </div>

            {/* 90 Minute Package */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-2">
              <div className="text-center mb-6">
                <div className="inline-block px-4 py-2 rounded-full mb-4" style={{ backgroundColor: '#B7CF3F' }}>
                  <span className="text-sm font-semibold text-white" style={{ color: '#1A0089' }}> COMPLETE</span>
                </div>
                <h4 className="text-3xl font-bold font-serif mb-2" style={{ color: '#1A0089' }}>90 Minutes</h4>
                <div className="text-5xl font-bold mb-2" style={{ color: '#1A0089' }}>$199</div>
                <p className="text-sm opacity-60" style={{ color: '#1A0089' }}>Comprehensive life story</p>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#FF5E33' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#1A0089' }}>Professional interviewer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#FF5E33' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#1A0089' }}>High-quality recording</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#FF5E33' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#1A0089' }}>Professional editing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#FF5E33' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#1A0089' }}>Delivered in 5-7 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#FF5E33' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#1A0089' }}>Full transcript included</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg" style={{ color: '#FF5E33' }}>✓</span>
                  <span className="text-sm opacity-80" style={{ color: '#1A0089' }}>Written memoir summary</span>
                </li>
              </ul>
              <Link href="/checkout">
                <button className="w-full px-6 py-3 rounded-full font-semibold transition-all duration-300 border-2 hover:shadow-lg hover:scale-105 hover:-translate-y-1" style={{ borderColor: '#1A0089', color: '#1A0089', backgroundColor: 'transparent' }}>
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <h3 className="text-3xl md:text-4xl font-bold font-serif text-center mb-4" style={{ color: '#1A0089' }}>
          Little Love Notes from Dearly Users ❤️
        </h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer">
            <p className="text-sm mb-4 italic" style={{ color: '#1A0089' }}>
              &quot;This was the best gift I&apos;ve ever given. My grandmother shared stories I&apos;d never heard before. Absolutely priceless.&quot;
            </p>
            <p className="text-xs font-semibold" style={{ color: '#1A0089' }}>— Sarah M.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer">
            <p className="text-sm mb-4 italic" style={{ color: '#1A0089' }}>
              &quot;The interviewer was so professional and made my dad feel comfortable. We now have his WWII stories preserved forever.&quot;
            </p>
            <p className="text-xs font-semibold" style={{ color: '#1A0089' }}>— Michael T.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer">
            <p className="text-sm mb-4 italic" style={{ color: '#1A0089' }}>
              &quot;I wish I had done this sooner. The quality is amazing and the process was so easy. Highly recommend!&quot;
            </p>
            <p className="text-xs font-semibold" style={{ color: '#1A0089' }}>— Jennifer L.</p>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-bold font-serif mb-6" style={{ color: '#1A0089' }}>
            Start preserving memories today
          </h3>
          <Link href="/checkout">
            <button className="px-8 py-3 rounded-full text-white font-semibold transition-all duration-300 mb-4 hover:shadow-xl hover:scale-105 hover:-translate-y-1" style={{ backgroundColor: '#1A0089' }}>
              Book Your Interview
            </button>
          </Link>
          <p className="text-sm opacity-60" style={{ color: '#1A0089' }}>
            Simple booking • Professional results • Memories that last forever
                </p>
              </div>
      </section>


      {/* FAQ Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold font-serif text-center mb-12" style={{ color: '#1A0089' }}>
            FAQ
          </h3>
          <div className="space-y-6">
            <div className="border-b-2 pb-6" style={{ borderColor: 'rgba(26, 0, 137, 0.1)' }}>
              <h4 className="text-xl font-semibold mb-3" style={{ color: '#1A0089' }}>
                Who can I interview?
              </h4>
              <p className="opacity-70" style={{ color: '#1A0089' }}>
                Anyone special in your life! Parents, grandparents, mentors, friends - anyone whose story deserves to be preserved.
              </p>
            </div>
            <div className="border-b-2 pb-6" style={{ borderColor: 'rgba(26, 0, 137, 0.1)' }}>
              <h4 className="text-xl font-semibold mb-3" style={{ color: '#1A0089' }}>
                How does the interview work?
              </h4>
              <p className="opacity-70" style={{ color: '#1A0089' }}>
                After booking, you&apos;ll schedule a time via Google Meet, Zoom, or phone. Our professional interviewer will guide the conversation.
              </p>
            </div>
            <div className="border-b-2 pb-6" style={{ borderColor: 'rgba(26, 0, 137, 0.1)' }}>
              <h4 className="text-xl font-semibold mb-3" style={{ color: '#1A0089' }}>
                What do I receive?
              </h4>
              <p className="opacity-70" style={{ color: '#1A0089' }}>
                A professionally edited audio recording delivered within 5-7 business days, ready to share with family or keep as a treasured keepsake.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Food for Thought / Final CTA Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="relative h-96 rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl" style={{ backgroundColor: '#B7CF3F' }}>
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#1A0089' }}>
              A moment to reflect
            </h3>
            <p className="text-lg mb-4 opacity-80" style={{ color: '#1A0089' }}>
              When was the last time you asked your loved ones about their childhood? Their first love? The moments that changed everything?
            </p>
            <p className="text-lg mb-6 opacity-80" style={{ color: '#1A0089' }}>
              These conversations won&apos;t happen on their own. Make time for what matters before time runs out.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-3 rounded-full border-2 focus:outline-none focus:border-opacity-100 transition-all duration-300"
                style={{
                  borderColor: '#1A0089',
                  color: '#1A0089'
                }}
              />
              <button
                type="submit"
                className="px-8 py-3 rounded-full text-white font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 whitespace-nowrap"
                style={{ backgroundColor: '#1A0089' }}
              >
                Stay Updated
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 mt-24" style={{ backgroundColor: '#1A0089' }}>
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto mb-12">
            <div>
              <h4 className="font-bold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-sm text-white opacity-80">
                <li><Link href="#" className="hover:opacity-100">Features</Link></li>
                <li><Link href="#" className="hover:opacity-100">Pricing</Link></li>
                <li><Link href="#" className="hover:opacity-100">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-sm text-white opacity-80">
                <li><Link href="#" className="hover:opacity-100">About</Link></li>
                <li><Link href="#" className="hover:opacity-100">Blog</Link></li>
                <li><Link href="#" className="hover:opacity-100">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Resources</h4>
              <ul className="space-y-2 text-sm text-white opacity-80">
                <li><Link href="#" className="hover:opacity-100">Help Center</Link></li>
                <li><Link href="#" className="hover:opacity-100">Privacy</Link></li>
                <li><Link href="#" className="hover:opacity-100">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Social</h4>
              <ul className="space-y-2 text-sm text-white opacity-80">
                <li><Link href="#" className="hover:opacity-100">Twitter</Link></li>
                <li><Link href="#" className="hover:opacity-100">Instagram</Link></li>
                <li><Link href="#" className="hover:opacity-100">Facebook</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white border-opacity-20 pt-8 text-center text-white opacity-60 text-sm">
          <p>&copy; 2025 Dearly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
