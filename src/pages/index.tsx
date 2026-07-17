import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from 'react-query';

interface Drug {
  name: string;
  searchCount?: number;
}

export default function Landing() {
  const { data: trendingDrugs } = useQuery(
    'trendingDrugs',
    async () => {
      const res = await fetch('/api/trending');
      if (!res.ok) throw new Error('Failed to fetch trending');
      return res.json();
    },
    { staleTime: 1000 * 60 * 5 } // Cache for 5 minutes
  );

  return (
    <>
      <Head>
        <title>Rx Savings Aggregator - Save on Your Prescriptions</title>
        <meta
          name="description"
          content="Compare prescription drug prices across GoodRx, SingleCare, RxSaver and more. Find the lowest prices and biggest savings."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Rx Savings Aggregator" />
        <meta
          property="og:description"
          content="Save money on prescriptions by comparing prices across multiple platforms"
        />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-3xl">💊</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Rx Savings
              </h1>
            </div>
            <Link
              href="/search"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
            >
              Search
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Save <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Big</span> on
              Your Prescriptions
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Compare prescription drug prices across GoodRx, SingleCare, RxSaver and more. 
              Find the lowest prices, best coupons, and biggest savings in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center flex-wrap mb-12">
              <Link
                href="/search"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold text-lg transition transform hover:scale-105"
              >
                Start Saving Now →
              </Link>
              <button
                onClick={() => {
                  const element = document.getElementById('how-it-works');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 border-2 border-gray-300 hover:border-indigo-600 text-gray-900 hover:text-indigo-600 rounded-lg font-semibold text-lg transition"
              >
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-12">
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">3</div>
                <p className="text-gray-600">Pharmacy Platforms</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">50%+</div>
                <p className="text-gray-600">Average Savings</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">Real-time</div>
                <p className="text-gray-600">Price Updates</p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo/Preview Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white/50">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-100 bg-gradient-to-br from-indigo-100 to-blue-100 h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💳</div>
                <p className="text-gray-700 font-semibold">Compare prices from multiple platforms instantly</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">
              How It Works
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto">
                  1
                </div>
                <h4 className="text-xl font-bold text-gray-900 text-center mb-3">
                  Enter Drug Name
                </h4>
                <p className="text-gray-600 text-center">
                  Simply type in the name of your prescription drug. Add optional dosage and quantity.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto">
                  2
                </div>
                <h4 className="text-xl font-bold text-gray-900 text-center mb-3">
                  Compare Prices
                </h4>
                <p className="text-gray-600 text-center">
                  We instantly search GoodRx, SingleCare, RxSaver and other platforms for you.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto">
                  3
                </div>
                <h4 className="text-xl font-bold text-gray-900 text-center mb-3">
                  Save & Share
                </h4>
                <p className="text-gray-600 text-center">
                  Find the best deal, get coupon codes, and save up to 80% on your prescription.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Drugs */}
        {trendingDrugs?.data && trendingDrugs.data.length > 0 && (
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="max-w-5xl mx-auto">
              <h3 className="text-4xl font-bold text-center text-gray-900 mb-4">
                Popular Drugs
              </h3>
              <p className="text-center text-gray-600 mb-12">
                Search for commonly requested prescriptions
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {trendingDrugs.data.slice(0, 8).map((drug: Drug, idx: number) => (
                  <Link
                    key={idx}
                    href={`/search?q=${encodeURIComponent(drug.name)}`}
                    className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer border border-gray-100 hover:border-indigo-300 group"
                  >
                    <div className="text-2xl mb-2">💊</div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                      {drug.name}
                    </h4>
                    {drug.searchCount && (
                      <p className="text-sm text-gray-500 mt-2">
                        {drug.searchCount} searches
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">
              Why Choose Us
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature 1 */}
              <div className="flex gap-4">
                <div className="text-4xl flex-shrink-0">🚀</div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast</h4>
                  <p className="text-gray-600">
                    Get results in seconds. Real-time price comparison across all platforms.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4">
                <div className="text-4xl flex-shrink-0">🎯</div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Accurate Prices</h4>
                  <p className="text-gray-600">
                    Direct integration with pharmacy platforms ensures up-to-date pricing.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4">
                <div className="text-4xl flex-shrink-0">💰</div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Maximum Savings</h4>
                  <p className="text-gray-600">
                    Compare all discount programs to find your best deal every single time.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex gap-4">
                <div className="text-4xl flex-shrink-0">🔒</div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">100% Free & Safe</h4>
                  <p className="text-gray-600">
                    No sign-up required. No personal health data stored. Completely private.
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="flex gap-4">
                <div className="text-4xl flex-shrink-0">📱</div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Mobile Friendly</h4>
                  <p className="text-gray-600">
                    Search anytime, anywhere. Perfect for comparing prices at the pharmacy.
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="flex gap-4">
                <div className="text-4xl flex-shrink-0">🏥</div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Trusted Sources</h4>
                  <p className="text-gray-600">
                    Compare prices from GoodRx, SingleCare, RxSaver and other major platforms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platforms */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-4xl font-bold text-center text-gray-900 mb-4">
              We Compare
            </h3>
            <p className="text-center text-gray-600 mb-12">
              All major prescription discount platforms in one place
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {[
                { name: 'GoodRx', icon: '💚' },
                { name: 'SingleCare', icon: '🩺' },
                { name: 'RxSaver', icon: '💙' },
              ].map((platform, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="text-5xl mb-3">{platform.icon}</div>
                  <p className="font-semibold text-gray-900">{platform.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-4xl font-bold text-white mb-6">
              Ready to Save on Your Prescriptions?
            </h3>
            <p className="text-xl text-blue-100 mb-8">
              Start comparing prices now and see how much you can save.
            </p>
            <Link
              href="/search"
              className="inline-block px-8 py-4 bg-white hover:bg-gray-100 text-indigo-600 rounded-lg font-semibold text-lg transition transform hover:scale-105"
            >
              Search Your Prescriptions →
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h3>

            <div className="space-y-6">
              {[
                {
                  q: 'Is this service really free?',
                  a: 'Yes! We compare prices from multiple platforms at no cost. We don\'t charge users or take a cut from pharmacies.',
                },
                {
                  q: 'Do I need to create an account?',
                  a: 'No account needed! Just search for your drug and see prices instantly. No personal data is required.',
                },
                {
                  q: 'Are the prices updated in real-time?',
                  a: 'Yes, we pull prices directly from pharmacy platforms and cache them for 24 hours to ensure accuracy.',
                },
                {
                  q: 'Can I use the coupons from the results?',
                  a: 'Absolutely! You\'ll get direct coupon codes and links to use at participating pharmacies.',
                },
              ].map((faq, idx) => (
                <details
                  key={idx}
                  className="group border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-indigo-300 transition"
                >
                  <summary className="flex items-center justify-between font-semibold text-gray-900">
                    {faq.q}
                    <span className="ml-4 transform group-open:rotate-180 transition">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-4 text-gray-600 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="text-white font-bold mb-4">About</h4>
                <p className="text-sm leading-relaxed">
                  Rx Savings Aggregator helps you find the lowest prescription prices.
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Quick Links</h4>
                <ul className="text-sm space-y-2">
                  <li>
                    <Link href="/search" className="hover:text-white transition">
                      Search
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      About
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Legal</h4>
                <ul className="text-sm space-y-2">
                  <li>
                    <a href="#" className="hover:text-white transition">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      Terms
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Platforms</h4>
                <ul className="text-sm space-y-2">
                  <li>GoodRx</li>
                  <li>SingleCare</li>
                  <li>RxSaver</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-sm">
              <p>&copy; 2024 Rx Savings Aggregator. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
