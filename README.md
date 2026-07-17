# Rx Savings Aggregator

A Next.js application that aggregates and compares prescription drug prices across multiple pharmacy discount platforms (GoodRx, SingleCare, RxSaver).

## Features

- 💊 **Multi-Platform Comparison**: Compare prices from GoodRx, SingleCare, and RxSaver
- 🚀 **Real-time Pricing**: Live price aggregation with intelligent fallbacks
- 💰 **Savings Calculator**: See potential savings across all platforms
- 📊 **Analytics**: Track trending drugs and popular searches
- 🔍 **Smart Search**: Find drugs by name, dosage, and quantity
- 🎯 **Coupon Extraction**: Get discount codes automatically
- 📱 **Mobile Friendly**: Responsive design for all devices
- 🔒 **Privacy First**: No sign-up required, no personal data stored

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Validation**: Zod
- **HTTP Client**: Axios
- **State Management**: React Query

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis instance

### Local Development

1. **Clone and install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rx_savings"

# Redis
REDIS_URL="redis://localhost:6379"

# API Keys (optional - will use web scraping as fallback)
GOODRX_API_KEY="your_api_key"
SINGLECARE_API_KEY="your_api_key"
RXSAVER_API_KEY="your_api_key"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000"
CACHE_TTL=86400
```

3. **Set up the database**
```bash
npm run db:push
```

4. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## Deployment on Vercel

### Easy Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fadministratives%2Fdrugs&env=DATABASE_URL,REDIS_URL,GOODRX_API_KEY,SINGLECARE_API_KEY,RXSAVER_API_KEY,NEXT_PUBLIC_API_URL&project-name=rx-savings-aggregator&repository-name=drugs)

### Manual Deployment

1. **Push to GitHub**
```bash
git push origin main
```

2. **Create Vercel Project**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Set environment variables in Project Settings:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `REDIS_URL`: Your Redis connection string
     - `GOODRX_API_KEY`: (Optional)
     - `SINGLECARE_API_KEY`: (Optional)
     - `RXSAVER_API_KEY`: (Optional)
     - `NEXT_PUBLIC_API_URL`: Your production URL

3. **Deploy**
   - Click Deploy
   - Wait for build to complete

### Environment Variables Needed

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

Optional (will use web scraping if not provided):
- `GOODRX_API_KEY`
- `SINGLECARE_API_KEY`
- `RXSAVER_API_KEY`

## Project Structure

```
src/
├── components/          # React components
│   ├── SearchForm.tsx
│   └── PriceComparison.tsx
├── lib/                # Utilities
│   ├── redis.ts        # Redis client
│   ├── prisma.ts       # Prisma client
│   └── validators.ts   # Zod schemas
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   │   ├── search.ts   # Price search endpoint
│   │   ├── health.ts   # Health check
│   │   └── trending.ts # Trending drugs
│   ├── index.tsx       # Landing page
│   ├── search.tsx      # Search page
│   ├── results.tsx     # Results page
│   └── _app.tsx        # App wrapper
├── services/           # Business logic
│   ├── aggregator.ts   # Price aggregation
│   └── scraper/        # Platform scrapers
│       ├── goodrx.ts
│       ├── singlecare.ts
│       └── rxsaver.ts
└── styles/             # Global styles

prisma/
├── schema.prisma       # Database schema
└── migrations/         # Database migrations
```

## API Endpoints

### Search Prices
```
GET /api/search?name=Lisinopril&dosage=10mg&quantity=30
```

Response:
```json
{
  "success": true,
  "data": {
    "drug": "Lisinopril",
    "dosage": "10mg",
    "quantity": 30,
    "results": [...],
    "bestPrice": {...},
    "timestamp": "2024-01-01T00:00:00Z",
    "sources": ["GoodRx", "SingleCare", "RxSaver"]
  }
}
```

### Get Trending Drugs
```
GET /api/trending?limit=10
```

### Health Check
```
GET /api/health
```

## Database Setup

The database uses Prisma ORM with the following models:

- **Drug**: Prescription drug information
- **Pharmacy**: Pharmacy/store locations
- **PriceSource**: Discount platforms (GoodRx, SingleCare, etc.)
- **Price**: Price data with coupons and discounts
- **Search**: Search history for analytics

## Scraper Integration

### GoodRx
- API endpoint with Bearer token authentication
- Web scraping fallback with Cheerio
- Automatic cookie/header management

### SingleCare
- API endpoint with X-API-Key header
- Web scraping with embedded JSON parsing
- Coupon extraction

### RxSaver
- API endpoint with Bearer token
- Table-based HTML parsing
- Member exclusive deals tracking

All scrapers include:
- 24-hour Redis caching
- Error handling and fallbacks
- Rate limiting awareness
- User-Agent rotation

## Performance

- **Caching**: 24-hour Redis cache for all price queries
- **Database**: Indexed queries for fast searches
- **Frontend**: React Query for client-side caching
- **Build**: Optimized Next.js production build
- **Deployment**: Vercel edge functions and serverless

## Security

- No personal health data stored
- HTTPS only in production
- Environment variables for sensitive data
- Input validation with Zod
- CORS headers configured
- Rate limiting ready (add Vercel rate limiting)

## Legal Compliance

⚠️ Before using in production:
- Review Terms of Service for each pharmacy platform
- Implement proper robots.txt compliance
- Consider reaching out to platforms for API partnerships
- Ensure compliance with HIPAA and healthcare regulations
- Add proper disclaimers about pricing accuracy

## Support & Documentation

For issues or questions:
1. Check the FAQ on the landing page
2. Review `.env.local.example` for configuration
3. Check GitHub Issues
4. Review Prisma documentation for database questions

## License

MIT

## Next Steps

- [ ] Add user accounts for saved searches
- [ ] Email alerts for price drops
- [ ] Integration with more pharmacy platforms
- [ ] Insurance coverage information
- [ ] Mobile app
- [ ] Analytics dashboard
- [ ] Price history tracking
- [ ] Pharmacy location filtering
