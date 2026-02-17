# Wadhwani Ventures Backend API

Production-ready Node.js backend for the Assisted Venture Growth Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase project credentials

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── supabase.ts   # Supabase client setup
│   │   └── env.ts        # Environment variables
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # JWT authentication
│   │   └── errorHandler.ts  # Error handling
│   ├── routes/           # API routes
│   │   ├── health.ts     # Health check
│   │   └── index.ts      # Route aggregator
│   ├── services/         # Business logic (coming soon)
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   │   ├── logger.ts     # Logging
│   │   └── response.ts   # Standard responses
│   └── index.ts          # Server entry point
├── package.json
├── tsconfig.json
└── .env
```

## 🔧 Environment Variables

```env
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (optional)

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

Returns server status and version information.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-17T12:00:00Z",
  "service": "Wadhwani Ventures API",
  "version": "1.0.0",
  "environment": "development"
}
```

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🛠️ Development

### Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm run build
npm start
```

### Testing

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/ventures
```

## 📦 Dependencies

### Core
- **express** - Web framework
- **@supabase/supabase-js** - Supabase client
- **cors** - CORS middleware
- **helmet** - Security headers
- **dotenv** - Environment variables
- **zod** - Schema validation

### Development
- **typescript** - Type safety
- **tsx** - TypeScript execution
- **@types/*** - Type definitions

## 🚀 Deployment

### Railway (Recommended)

1. Create new project on Railway
2. Connect GitHub repository
3. Set environment variables
4. Deploy automatically

### Render

1. Create new Web Service
2. Connect repository
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variables

## 📝 Next Steps

- [ ] Add auth routes (signup, login, logout)
- [ ] Add venture CRUD endpoints
- [ ] Add stream management endpoints
- [ ] Add request validation with Zod
- [ ] Add rate limiting
- [ ] Add comprehensive logging
- [ ] Add unit tests
- [ ] Add API documentation (Swagger)

## 🤝 Contributing

See [CONTRIBUTING.md](../docs/CONTRIBUTING.md) for guidelines.

## 📄 License

MIT
