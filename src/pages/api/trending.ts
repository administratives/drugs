import type { NextApiRequest, NextApiResponse } from 'next';
import { getTrendingDrugs } from '@/services/aggregator';

type ResponseData = {
  success: boolean;
  data?: any[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const drugs = await getTrendingDrugs(limit);

    res.status(200).json({
      success: true,
      data: drugs,
    });
  } catch (error: any) {
    console.error('Trending drugs error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch trending drugs',
    });
  }
}
