# Facility API - Azure Container Apps

Express.js-baserad API-tjänst som ersätter Supabase Edge Functions för Azure Container Apps.

## Struktur

```
azure/api/
├── src/
│   ├── index.ts           # Express server entry point
│   ├── db.ts              # PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.ts        # JWT authentication middleware
│   └── routes/
│       ├── auth.ts        # Login/Register endpoints
│       ├── public-api.ts  # Public read-only endpoints
│       ├── admin-api.ts   # Protected CRUD endpoints
│       └── geocode.ts     # Geocoding service
├── Dockerfile             # Multi-stage Docker build
├── package.json
├── tsconfig.json
└── .env.example
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user

### Public API (no auth required)
- `GET /api/public/facilities` - List facilities (filter: id, kommun_id, facility_type_id)
- `GET /api/public/facilities-map` - Map-optimized facilities
- `GET /api/public/municipalities` - List municipalities
- `GET /api/public/facility-types` - List facility types

### Admin API (JWT required)
- `GET /api/admin/facilities` - List user's facilities
- `POST /api/admin/facilities` - Create facility
- `PUT /api/admin/facilities/:id` - Update facility
- `DELETE /api/admin/facilities/:id` - Delete facility

### Geocoding
- `POST /api/geocode` - Geocode address to coordinates

## Local Development

```bash
cd azure/api
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

## Build Docker Image

```bash
cd azure/api
docker build -t facility-api .
docker run -p 3000:3000 --env-file .env facility-api
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DB_HOST | PostgreSQL host | Yes |
| DB_PORT | PostgreSQL port (default: 5432) | No |
| DB_NAME | Database name | Yes |
| DB_USER | Database user | Yes |
| DB_PASSWORD | Database password | Yes |
| DB_SSL | Enable SSL (true/false) | No |
| JWT_SECRET | Secret for JWT signing (min 32 chars) | Yes |
| PORT | Server port (default: 3000) | No |
| CORS_ORIGIN | CORS origin (* for all) | No |

## Database Schema Updates

Profils-tabellen behöver uppdateras för egen autentisering (utan Supabase Auth):

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
```
