import axios from 'axios';
import { cacheGet, cacheSet } from '@/lib/redis';
import * as cheerio from 'cheerio';

export interface SingleCarePrice {
  price: number;
  discount: number;
  couponCode?: string;
  pharmacy: string;
  expiresAt?: string;
  url?: string;
}

interface SingleCareAPIResponse {
  results?: Array<{
    price: number;
    pharmacy_name: string;
    discount_percent?: number;
    promo_code?: string;
  }>;
}

const SINGLECARE_BASE_URL = 'https://www.singlecare.com';
const SINGLECARE_API_URL = 'https://api.singlecare.com/v1';

/**
 * Search SingleCare using their API endpoint
 * SingleCare provides direct API access for partner integrations
 */
async function searchSingleCareAPI(
  drugName: string,
  dosage?: string,
  quantity: number = 30
): Promise<SingleCarePrice[]> {
  try {
    const apiKey = process.env.SINGLECARE_API_KEY;
    if (!apiKey) {
      console.warn('SingleCare API key not configured');
      return [];
    }

    const params = new URLSearchParams({
      drug: drugName,
      quantity: String(quantity),
      ...(dosage && { strength: dosage }),
    });

    const response = await axios.get<SingleCareAPIResponse>(
      `${SINGLECARE_API_URL}/prices?${params}`,
      {
        headers: {
          'X-API-Key': apiKey,
          'Accept': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (!response.data.results || response.data.results.length === 0) {
      return [];
    }

    return response.data.results.map((result) => ({
      price: result.price,
      discount: result.discount_percent || 0,
      couponCode: result.promo_code,
      pharmacy: result.pharmacy_name,
    }));
  } catch (error) {
    console.error('SingleCare API error:', error);
    return [];
  }
}

/**
 * Scrape SingleCare website for price information
 */
async function searchSingleCareWeb(
  drugName: string,
  dosage?: string,
  quantity: number = 30
): Promise<SingleCarePrice[]> {
  try {
    const searchQuery = `${drugName}${dosage ? ` ${dosage}` : ''}`;
    const searchUrl = `${SINGLECARE_BASE_URL}/search?q=${encodeURIComponent(searchQuery)}&qty=${quantity}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const prices: SingleCarePrice[] = [];

    // SingleCare price cards structure
    $('[class*=\"PriceCard\"], [data-testid*=\"price\"]').each((_, element) => {
      const $card = $(element);
      const text = $card.text();
      const html = $card.html() || '';

      // Extract price
      const priceMatch = text.match(/\$(\d+\.\d{2})/);
      // Extract pharmacy
      const pharmacyMatch = html.match(/pharmacy["\']?\s*:\s*["\']?([^"\'\\n]+)/i) ||
        text.match(/at\\s+([A-Za-z\\s&]+(?:Pharmacy|Pharmacies|Store))/i);
      // Extract discount
      const discountMatch = text.match(/save\\s*(\d+)%/i) ||
        text.match(/(\d+)%\\s*off/i);

      if (priceMatch && pharmacyMatch) {
        prices.push({
          price: parseFloat(priceMatch[1]),
          discount: discountMatch ? parseInt(discountMatch[1]) : 0,
          pharmacy: pharmacyMatch[1].trim().replace(/\\s+/g, ' '),
          url: searchUrl,
        });
      }
    });

    // Alternative: Look for JSON data embedded in page
    const scripts = $('script').get();
    for (const script of scripts) {
      const content = $(script).html();
      if (content && content.includes('prices')) {
        try {
          const jsonMatch = content.match(/\\{[^}]*prices[^}]*\\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            if (Array.isArray(data)) {
              data.forEach((item: any) => {
                if (item.price && item.pharmacy) {
                  prices.push({
                    price: parseFloat(item.price),
                    discount: item.discount || 0,
                    couponCode: item.coupon,
                    pharmacy: item.pharmacy,
                    url: searchUrl,
                  });
                }
              });
            }
          }
        } catch (e) {
          // Continue if JSON parsing fails
        }
      }
    }

    return prices;
  } catch (error) {
    console.error('SingleCare web scraping error:', error);
    return [];
  }
}

/**
 * Main search function for SingleCare
 * Tries API first, then falls back to web scraping
 */
export async function searchSingleCare(
  drugName: string,
  dosage?: string,
  quantity: number = 30
): Promise<SingleCarePrice[]> {
  const cacheKey = `singlecare:${drugName}:${dosage}:${quantity}`;

  // Check cache first
  const cached = await cacheGet<SingleCarePrice[]>(cacheKey);
  if (cached && cached.length > 0) {
    return cached;
  }

  try {
    // Try API first
    let results = await searchSingleCareAPI(drugName, dosage, quantity);

    // Fall back to web scraping if API returns nothing
    if (results.length === 0) {
      results = await searchSingleCareWeb(drugName, dosage, quantity);
    }

    // Limit results to top 10
    results = results.slice(0, 10);

    // Cache for 24 hours
    if (results.length > 0) {
      await cacheSet(cacheKey, results, 86400);
    }

    return results;
  } catch (error) {
    console.error('SingleCare search error:', error);
    throw new Error(
      `Failed to search SingleCare: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get coupon information from SingleCare
 */
export async function getSingleCareCoupon(drugName: string): Promise<string | null> {
  try {
    const response = await axios.get(
      `${SINGLECARE_BASE_URL}/prescription/${encodeURIComponent(drugName)}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      }
    );

    const $ = cheerio.load(response.data);
    const couponCode = $('[data-testid="coupon-code"], [class*="coupon"]')
      .first()
      .text()
      .trim();

    return couponCode || null;
  } catch (error) {
    console.error('Error fetching SingleCare coupon:', error);
    return null;
  }
}
