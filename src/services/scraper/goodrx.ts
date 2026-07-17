import axios from 'axios';
import { cacheGet, cacheSet } from '@/lib/redis';
import * as cheerio from 'cheerio';

export interface GoodRxPrice {
  price: number;
  discount: number;
  couponCode?: string;
  pharmacy: string;
  expiresAt?: string;
  url?: string;
}

interface GoodRxSearchResult {
  prices: Array<{
    price: number;
    pharmacy: {
      name: string;
    };
    discount_percent?: number;
    coupon?: string;
    expiration?: string;
  }>;
}

const GOODRX_BASE_URL = 'https://www.goodrx.com';
const GOODRX_API_URL = 'https://api.goodrx.com';

/**
 * Search GoodRx using their API endpoint
 * Note: This requires a valid GoodRx API key
 */
async function searchGoodRxAPI(
  drugName: string,
  dosage?: string,
  quantity?: number
): Promise<GoodRxPrice[]> {
  try {
    const apiKey = process.env.GOODRX_API_KEY;
    if (!apiKey) {
      console.warn('GoodRx API key not configured, falling back to web scraping');
      return [];
    }

    const params = new URLSearchParams({
      drug_name: drugName,
      ...(dosage && { strength: dosage }),
      ...(quantity && { quantity: String(quantity) }),
    });

    const response = await axios.get<GoodRxSearchResult>(
      `${GOODRX_API_URL}/search?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (!response.data.prices || response.data.prices.length === 0) {
      return [];
    }

    return response.data.prices.map((price) => ({\n      price: price.price,\n      discount: price.discount_percent || 0,\n      couponCode: price.coupon,\n      pharmacy: price.pharmacy.name,\n      expiresAt: price.expiration,\n    }));
  } catch (error) {
    console.error('GoodRx API error:', error);
    return [];
  }
}

/**
 * Scrape GoodRx website for price information
 * Uses Cheerio for HTML parsing
 */
async function searchGoodRxWeb(
  drugName: string,
  dosage?: string,
  quantity: number = 30
): Promise<GoodRxPrice[]> {
  try {
    // Construct search URL
    const searchQuery = `${drugName}${dosage ? ` ${dosage}` : ''}`;
    const searchUrl = `${GOODRX_BASE_URL}/search?q=${encodeURIComponent(searchQuery)}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const prices: GoodRxPrice[] = [];

    // Parse price cards from the page
    // Note: This selector may need updating if GoodRx changes their HTML structure
    $('[data-testid=\"price-card\"]').each((_, element) => {
      const $card = $(element);

      const priceText = $card.find('[data-testid=\"price\"]').text();
      const pharmacyName = $card.find('[data-testid=\"pharmacy-name\"]').text();
      const discountText = $card.find('[data-testid=\"discount\"]').text();
      const couponCode = $card.find('[data-testid=\"coupon-code\"]').text();

      if (priceText && pharmacyName) {
        const price = parseFloat(priceText.replace('$', '').trim());
        const discount = parseInt(discountText?.replace('%', '') || '0');

        prices.push({
          price,
          discount,
          couponCode: couponCode || undefined,
          pharmacy: pharmacyName.trim(),
          url: searchUrl,
        });
      }
    });

    // If no prices found, try alternative selectors
    if (prices.length === 0) {
      $('div[class*=\"PriceCard\"]').each((_, element) => {
        const $card = $(element);
        const text = $card.text();

        // Try to extract price using regex
        const priceMatch = text.match(/\$(\d+\.\d{2})/);
        const pharmacyMatch = text.match(/(?:at|from)\\s+([A-Za-z\\s]+)/);
        const discountMatch = text.match(/(\d+)%\\s+(?:off|discount)/);

        if (priceMatch && pharmacyMatch) {
          prices.push({
            price: parseFloat(priceMatch[1]),
            discount: discountMatch ? parseInt(discountMatch[1]) : 0,
            pharmacy: pharmacyMatch[1].trim(),
            url: searchUrl,
          });
        }
      });
    }

    return prices;
  } catch (error) {
    console.error('GoodRx web scraping error:', error);
    return [];
  }
}

/**
 * Main search function for GoodRx
 * Tries API first, then falls back to web scraping
 */
export async function searchGoodRx(
  drugName: string,
  dosage?: string,
  quantity: number = 30
): Promise<GoodRxPrice[]> {
  const cacheKey = `goodrx:${drugName}:${dosage}:${quantity}`;

  // Check cache first
  const cached = await cacheGet<GoodRxPrice[]>(cacheKey);
  if (cached && cached.length > 0) {
    return cached;
  }

  try {
    // Try API first
    let results = await searchGoodRxAPI(drugName, dosage, quantity);

    // Fall back to web scraping if API returns nothing
    if (results.length === 0) {
      results = await searchGoodRxWeb(drugName, dosage, quantity);
    }

    // Limit results to top 10
    results = results.slice(0, 10);

    // Cache for 24 hours
    if (results.length > 0) {
      await cacheSet(cacheKey, results, 86400);
    }

    return results;
  } catch (error) {
    console.error('GoodRx search error:', error);
    throw new Error(`Failed to search GoodRx: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get detailed drug information from GoodRx
 */
export async function getGoodRxDrugDetails(drugId: string) {
  try {
    const response = await axios.get(`${GOODRX_BASE_URL}/drugs/${drugId}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching GoodRx drug details:', error);
    return null;
  }
}
