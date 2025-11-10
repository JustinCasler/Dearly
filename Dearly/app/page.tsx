import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Dearly</h1>
          <Link 
            href="/login"
            className="text-gray-600 hover:text-indigo-600 transition"
          >
            Admin Login
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Preserve Your Loved One&apos;s Story Forever
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Book a professionally produced interview or podcast with someone special. 
            Capture their memories, wisdom, and stories for generations to come.
          </p>
          <Link
            href="/checkout"
            className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition shadow-lg"
          >
            Book Your Interview
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🎙️</div>
            <h3 className="text-xl font-semibold mb-3">Professional Quality</h3>
            <p className="text-gray-600">
              High-quality audio recording with experienced interviewers who know how to bring out the best stories.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-4xl mb-4">💝</div>
            <h3 className="text-xl font-semibold mb-3">Meaningful Gift</h3>
            <p className="text-gray-600">
              Give the gift of preserved memories. Perfect for birthdays, anniversaries, or any special occasion.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-xl font-semibold mb-3">Flexible Sessions</h3>
            <p className="text-gray-600">
              Choose from 30, 60, or 90-minute sessions. Conduct via Google Meet, Zoom, or phone.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Choose Your Package</h4>
                <p className="text-gray-600">
                  Select your preferred session length and provide questions you&apos;d like us to ask.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Schedule Your Interview</h4>
                <p className="text-gray-600">
                  After payment, you&apos;ll receive a link to book a time that works best for you and your loved one.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Receive Your Recording</h4>
                <p className="text-gray-600">
                  We&apos;ll professionally produce your interview and deliver the final recording within 5-7 business days.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-24 max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Pricing</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-gray-200">
              <h4 className="text-2xl font-bold mb-2">30 Minutes</h4>
              <p className="text-4xl font-bold text-indigo-600 mb-4">$150</p>
              <p className="text-gray-600 mb-6">Perfect for capturing key stories and memories</p>
              <Link
                href="/checkout"
                className="block w-full text-center bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Get Started
              </Link>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md border-4 border-indigo-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h4 className="text-2xl font-bold mb-2">60 Minutes</h4>
              <p className="text-4xl font-bold text-indigo-600 mb-4">$250</p>
              <p className="text-gray-600 mb-6">Ideal for a comprehensive life story interview</p>
              <Link
                href="/checkout"
                className="block w-full text-center bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Get Started
              </Link>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-gray-200">
              <h4 className="text-2xl font-bold mb-2">90 Minutes</h4>
              <p className="text-4xl font-bold text-indigo-600 mb-4">$350</p>
              <p className="text-gray-600 mb-6">Extended session for in-depth storytelling</p>
              <Link
                href="/checkout"
                className="block w-full text-center bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to Preserve Their Story?</h3>
          <Link
            href="/checkout"
            className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition shadow-lg"
          >
            Book Your Interview Now
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-24 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 Dearly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
