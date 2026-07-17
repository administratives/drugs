import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function SearchPage() {
  const router = useRouter();
  const [drugName, setDrugName] = useState(router.query.q ? String(router.query.q) : '');
  const [dosage, setDosage] = useState('');
  const [quantity, setQuantity] = useState('30');
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugName.trim()) return;

    setIsSearching(true);
    const params = new URLSearchParams({
      name: drugName,
      ...(dosage && { dosage }),
      ...(quantity && { quantity }),
    });

    router.push(`/results?${params.toString()}`);
  };

  return (
    <>
      <Head>
        <title>Search Prescriptions - Rx Savings Aggregator</title>
        <meta
          name="description"
          content="Search for the best prescription drug prices across all platforms"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-3xl">💊</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Rx Savings
              </h1>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Back to Home
            </Link>
          </div>
        </nav>

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold text-gray-900 mb-4">
                Find Your Best Price
              </h2>
              <p className="text-xl text-gray-600">
                Search for any prescription and compare prices instantly
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="space-y-6">
                {/* Drug Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Drug Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={drugName}
                    onChange={(e) => setDrugName(e.target.value)}
                    placeholder="e.g., Lisinopril, Metformin, Amoxicillin"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-lg"
                    required
                    autoFocus
                  />
                </div>

                {/* Dosage */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Dosage <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g., 10mg, 500mg, 1000mg"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-lg"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Quantity <span className="text-gray-400">(Tablets/Capsules)</span>
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="30"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-lg"
                    min="1"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSearching || !drugName.trim()}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Searching...
                    </span>
                  ) : (
                    'Compare Prices 🔍'
                  )}
                </button>
              </div>
            </form>

            {/* Popular Searches */}
            <div className="mt-12">
              <p className="text-center text-gray-600 mb-6 font-semibold">
                Try searching for popular prescriptions:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  'Lisinopril',
                  'Metformin',
                  'Atorvastatin',
                  'Amoxicillin',
                  'Ibuprofen',
                  'Aspirin',
                ].map((drug) => (
                  <button
                    key={drug}
                    onClick={() => setDrugName(drug)}
                    className="px-4 py-2 bg-white hover:bg-indigo-50 border-2 border-gray-200 hover:border-indigo-300 rounded-lg font-medium text-gray-900 hover:text-indigo-600 transition"
                  >
                    {drug}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Cards */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">✨</div>
                <h3 className="font-bold text-gray-900 mb-1">No Sign-up</h3>
                <p className="text-sm text-gray-600">
                  Search instantly without creating an account
                </p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">⚡</div>
                <h3 className="font-bold text-gray-900 mb-1">Real-time Prices</h3>
                <p className="text-sm text-gray-600">
                  Get the latest prices from all platforms
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">💰</div>
                <h3 className="font-bold text-gray-900 mb-1">Save 50%+</h3>
                <p className="text-sm text-gray-600">
                  Compare and find the best deals
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
