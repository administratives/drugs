import axios from 'axios';
import { cacheGet, cacheSet } from '@/lib/redis';
import * as cheerio from 'cheerio';

export interface RxSaverPrice {
  price: number;
  discount: number;
  couponCode?: string;
  pharmacy: string;
  expiresAt?: string;
  url?: string;
}

interface RxSaverAPIResponse {
  prices?: Array<{
    cost: number;
    store: string;
    savings?: number;
    coupon?: string;
  }>;
}

const RXSAVER_BASE_URL = 'https://www.rxsaver.com';
const RXSAVER_API_URL = 'https://api.rxsaver.com';

/**
 * Search RxSaver using their API endpoint
 */
async function searchRxSaverAPI(
  drugName: string,
  dosage?: string,
  quantity: number = 30
): Promise<RxSaverPrice[]> {
  try {
    const apiKey = process.env.RXSAVER_API_KEY;
    if (!apiKey) {
      console.warn('RxSaver API key not configured');
      return [];
    }

    const params = new URLSearchParams({
      name: drugName,
      quantity: String(quantity),
      ...(dosage && { strength: dosage }),
    });

    const response = await axios.get<RxSaverAPIResponse>(
      `${RXSAVER_API_URL}/v1/prices?${params}`,
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

    return response.data.prices.map((price) => ({
      price: price.cost,
      discount: price.savings || 0,
      couponCode: price.coupon,
      pharmacy: price.store,
    }));
  } catch (error) {
    console.error('RxSaver API error:', error);
    return [];
  }
}

/**
 * Scrape RxSaver website for price information
 */
async function searchRxSaverWeb(
  drugName: string,
  dosage?: string,
  quantity: number = 30
): Promise<RxSaverPrice[]> {
  try {
    const searchQuery = `${drugName}${dosage ? ` ${dosage}` : ''}`;
    const searchUrl = `${RXSAVER_BASE_URL}/search?q=${encodeURIComponent(searchQuery)}&qty=${quantity}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const prices: RxSaverPrice[] = [];

    // RxSaver result cards
    $('[class*="ResultCard"], [class*="PriceRow"], [data-testid*="result"]').each(
      (_, element) => {
        const $card = $(element);
        const text = $card.text();

        // Extract price (RxSaver often shows lowest price first)
        const priceMatch = text.match(/\$(\d+(?:\.\d{2})?)/);
        // Extract pharmacy/store name
        const storeMatch = text.match(/(?:at|from)\s+([A-Za-z\s&]+(?:Pharmacy|Pharmacies|Store|CVS|Walgreens|Walmart))/i);
        // Extract savings
        const savingsMatch = text.match(/save\s+(?:up\s+to\s+)?\$?(\d+)/i) ||
          text.match(/(\d+)%?\s+off/i);

        if (priceMatch && storeMatch) {
          prices.push({
            price: parseFloat(priceMatch[1]),
            discount: savingsMatch ? parseInt(savingsMatch[1]) : 0,
            pharmacy: storeMatch[1].trim(),
            url: searchUrl,
          });
        }
      }
    );

    // Alternative: Extract from table rows
    if (prices.length === 0) {
      $('tr[data-testid*="price"], tbody tr').each((_, element) => {
        const $row = $(element);
        const cells = $row.find('td');

        if (cells.length >= 2) {
          const priceText = cells.eq(0).text();
          const pharmacyText = cells.eq(1).text();

          const priceMatch = priceText.match(/\$(\d+\.\d{2})/);
          if (priceMatch && pharmacyText.trim()) {
            prices.push({
              price: parseFloat(priceMatch[1]),
              discount: 0,
              pharmacy: pharmacyText.trim(),
              url: searchUrl,
            });
          }
        }
      });
    }

    return prices;
  } catch (error) {
    console.error('RxSaver web scraping error:', error);
    return [];
  }
}

/**
 * Main search function for RxSaver
 * Tries API first, then falls back to web scraping
 */
export async function searchRxSaver(
  drugName: string,
  dosage?: string,
  quantity: number = 30
): Promise<RxSaverPrice[]> {
  const cacheKey = `rxsaver:${drugName}:${dosage}:${quantity}`;

  // Check cache first
  const cached = await cacheGet<RxSaverPrice[]>(cacheKey);
  if (cached && cached.length > 0) {
    return cached;
  }

  try {
    // Try API first
    let results = await searchRxSaverAPI(drugName, dosage, quantity);

    // Fall back to web scraping if API returns nothing
    if (results.length === 0) {
      results = await searchRxSaverWeb(drugName, dosage, quantity);
    }

    // Limit results to top 10
    results = results.slice(0, 10);

    // Cache for 24 hours
    if (results.length > 0) {
      await cacheSet(cacheKey, results, 86400);
    }

    return results;
  } catch (error) {
    console.error('RxSaver search error:', error);
    throw new Error(
      `Failed to search RxSaver: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get RxSaver member exclusive deals
 */
export async function getRxSaverDeals(): Promise<Array<{ drug: string; savings: number }> | null> {
  try {
    const response = await axios.get(`${RXSAVER_BASE_URL}/deals`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const deals: Array<{ drug: string; savings: number }> = [];

    $('[class*="DealCard"], [data-testid*="deal"]').each((_, element) => {
      const $deal = $(element);
      const drugName = $deal.find('[class*="drug"], h3').text().trim();
      const savingsText = $deal.text();
      const savingsMatch = savingsText.match(/save\s+(?:up\s+to\s+)?\$?(\d+)/i);

      if (drugName && savingsMatch) {
        deals.push({
          drug: drugName,
          savings: parseInt(savingsMatch[1]),
        });
      }
    });

    return deals.length > 0 ? deals : null;
  } catch (error) {
    console.error('Error fetching RxSaver deals:', error);
    return null;
  }
}
