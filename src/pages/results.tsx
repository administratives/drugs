import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import SearchForm from '@/components/SearchForm';
import PriceComparison from '@/components/PriceComparison';
import { AggregatedPrice } from '@/services/aggregator';

export default function ResultsPage() {
  const router = useRouter();
  const { name, dosage, quantity } = router.query;

  const { data, isLoading, error } = useQuery(
    ['search', name, dosage, quantity],
    async () => {
      if (!name) return null;
      const params = new URLSearchParams({
        name: String(name),
        ...(dosage && { dosage: String(dosage) }),
        ...(quantity && { quantity: String(quantity) }),
      });
      const res = await fetch(`/api/search?${params}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    { enabled: !!name }
  );

  return (
    <>
      <Head>
        <title>
          {name ? `${name} Price Comparison` : 'Search Results'} - Rx Savings Aggregator
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Navigation */}
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/landing" className="flex items-center gap-2">
              <div className="text-3xl">💊</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Rx Savings
              </h1>
            </Link>
            <Link
              href="/search"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
            >
              New Search
            </Link>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search Form Section */}
          <div className="mb-12">
            <SearchForm
              onSearch={(params) => {
                router.push({
                  pathname: '/results',
                  query: params,
                });
              }}
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="inline-block">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg text-gray-600 font-semibold">Searching for best prices...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Checking GoodRx, SingleCare, RxSaver...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <h3 className="text-red-800 font-bold mb-2">Search Error</h3>
              <p className="text-red-700">
                {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
              </p>
              <Link
                href="/search"
                className="mt-4 inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
              >
                Try Another Search
              </Link>
            </div>
          )}

          {/* Results */}
          {data?.data && (
            <>
              {/* Results Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {data.data.drug} {data.data.dosage ? `${data.data.dosage}` : ''}
                </h2>
                <p className="text-gray-600">
                  Quantity: {data.data.quantity} tablets
                  {data.data && data.data.sources && (
                    <span className="ml-4">
                      • Found on: <span className="font-semibold">{data.data.sources.join(', ')}</span>
                    </span>
                  )}
                </p>
              </div>

              {/* Best Price Banner */}
              {data.data.bestPrice && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-8 mb-8 shadow-lg">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-green-700 text-sm font-semibold mb-2">
                        💚 Best Price Found
                      </p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-5xl font-bold text-green-600">
                          ${data.data.bestPrice.price.toFixed(2)}
                        </span>
                        <span className="text-xl text-gray-700">
                          at {data.data.bestPrice.pharmacy}
                        </span>
                      </div>
                      <p className="text-green-700 mt-3 font-semibold">
                        {data.data.bestPrice.source}
                        {data.data.bestPrice.discount > 0 && (
                          <span className="ml-3 text-lg">
                            Save {data.data.bestPrice.discount}%
                          </span>
                        )}
                      </p>
                      {data.data.bestPrice.couponCode && (
                        <div className="mt-4">
                          <p className="text-sm text-green-700 mb-2">Coupon Code:</p>
                          <code className="bg-white px-4 py-2 rounded font-mono font-bold text-gray-900 border-2 border-green-300">
                            {data.data.bestPrice.couponCode}
                          </code>
                        </div>
                      )}
                    </div>
                    <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition transform hover:scale-105">
                      View at {data.data.bestPrice.source} →
                    </button>
                  </div>
                </div>
              )}

              {/* Price Comparison Table */}
              {data.data.results && data.data.results.length > 0 ? (
                <PriceComparison
                  drug={data.data.drug}
                  dosage={data.data.dosage}
                  quantity={data.data.quantity}
                  results={data.data.results}
                  bestPrice={data.data.bestPrice}
                />
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-yellow-800">
                    No prices found for this drug. Try searching for a different drug or
                    adjust the dosage.
                  </p>
                </div>
              )}

              {/* Savings Calculator */}
              {data.data.results && data.data.results.length > 1 && (
                <div className="mt-12 bg-white rounded-lg shadow p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Savings Potential</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">Lowest Price</p>
                      <p className="text-3xl font-bold text-green-600">
                        $
                        {Math.min(
                          ...data.data.results.map((r: AggregatedPrice) => r.price)
                        ).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-2">Highest Price</p>
                      <p className="text-3xl font-bold text-red-600">
                        $
                        {Math.max(
                          ...data.data.results.map((r: AggregatedPrice) => r.price)
                        ).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-2">Potential Savings</p>
                      <p className="text-3xl font-bold text-indigo-600">
                        $
                        {(
                          Math.max(
                            ...data.data.results.map((r: AggregatedPrice) => r.price)
                          ) -
                          Math.min(
                            ...data.data.results.map((r: AggregatedPrice) => r.price)
                          )
                        ).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-2">Average Price</p>
                      <p className="text-3xl font-bold text-blue-600">
                        $
                        {(
                          data.data.results.reduce(
                            (sum: number, r: AggregatedPrice) => sum + r.price,
                            0
                          ) / data.data.results.length
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* No Search Yet */}
          {!name && !isLoading && !error && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Compare?</h3>
              <p className="text-gray-600 mb-8">
                Use the search form above to find the best prescription prices
              </p>
              <Link
                href="/search"
                className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition transform hover:scale-105"
              >
                Start Searching
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
