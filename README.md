# HomeTasks API

Backend API for HomeTasks mobile application built with NestJS, Prisma, and PostgreSQL.

## Tech Stack

- **Framework:** NestJS 11.x
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL 16
- **ORM:** Prisma 7.x
- **Validation:** class-validator, class-transformer
- **Containerization:** Docker, Docker Compose

## Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- Git

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

The default `.env` is already configured for local development with Docker.

### 3. Start Docker containers

Start PostgreSQL and pgAdmin:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on `localhost:5432`
- pgAdmin on `http://localhost:5050` (admin@hometasks.local / admin)

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Start the development server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in watch mode (development)
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the application
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

## Prisma Commands

- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma generate` - Generate Prisma Client
- `npx prisma db push` - Push schema changes without migrations

## API Endpoints

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-21T00:00:00.000Z",
  "service": "hometasks-api",
  "version": "0.0.1",
  "environment": "development"
}
```

## Project Structure

```
hometasks-api/
├── src/
│   ├── main.ts              # Application entry point
│   ├── app.module.ts        # Root module
│   ├── app.controller.ts    # Root controller
│   └── app.service.ts       # Root service
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── docker-compose.yml       # Docker services configuration
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment variables template
└── README.md                # This file
```

## Environment Variables

All environment variables are defined in `.env` (not tracked in git). Copy `.env.example` to get started.

### Database Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL username | `hometasks` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `hometasks_dev_password` |
| `POSTGRES_DB` | PostgreSQL database name | `hometasks_dev` |
| `DATABASE_URL` | Full PostgreSQL connection string | Constructed from above vars |

### pgAdmin Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `PGADMIN_EMAIL` | pgAdmin login email | `admin@hometasks.local` |
| `PGADMIN_PASSWORD` | pgAdmin login password | `admin` |

### Application Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | API server port | `3000` |

### JWT Configuration (to be used later)
| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_ACCESS_SECRET` | JWT access token secret | (change in production) |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | (change in production) |
| `JWT_ACCESS_EXPIRATION` | Access token expiration time | `15m` |
| `JWT_REFRESH_EXPIRATION` | Refresh token expiration time | `7d` |

## Docker Services

Docker Compose reads configuration from `.env` file automatically.

### PostgreSQL
- **Container:** hometasks-postgres
- **Port:** 5432
- **Credentials:** Configured via `POSTGRES_USER`, `POSTGRES_PASSWORD`
- **Database:** Configured via `POSTGRES_DB`

### pgAdmin
- **Container:** hometasks-pgadmin
- **URL:** http://localhost:5050
- **Credentials:** Configured via `PGADMIN_EMAIL`, `PGADMIN_PASSWORD`

## Development Workflow

1. Make changes to the code
2. The server will automatically reload (watch mode)
3. If you modify the Prisma schema:
   ```bash
   npx prisma migrate dev --name <migration-name>
   ```
4. Commit your changes following conventional commits

## Deployment

### Production Deployment (Dokploy)

For deploying to Dokploy, see the detailed guide:

📖 **[Dokploy Deployment Guide](./docs/DOKPLOY_DEPLOYMENT.md)**

Quick summary:

1. **Create PostgreSQL database** in Dokploy or use external service
2. **Create application** in Dokploy with Docker
3. **Configure environment variables** (DATABASE_URL, JWT secrets, etc.)
4. **Deploy** and verify with health check
5. **Run migrations**: `npx prisma migrate deploy`
6. **Run seeders** (optional): `npm run prisma:seed`

The API will be available at your Dokploy domain (e.g., `https://hometasks-api-dev.dokploy.app`)

### Docker Build

To build and test the Docker image locally:

```bash
# Build image
docker build -t hometasks-api:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e NODE_ENV=production \
  hometasks-api:latest

# Test
curl http://localhost:3000/health
```

### Environment Variables for Production

See `.env.production.example` for all required variables.

**Critical variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secure random string (use `openssl rand -hex 32`)
- `REFRESH_TOKEN_SECRET` - Secure random string
- `CORS_ORIGIN` - Your frontend URL

## API Collections

Import API collections for testing:

- **Postman**: `docs/postman_collections/HomeTasks_API.postman_collection.json`
- **Bruno**: `docs/bruno_collections/HomeTasks_API/`
- **cURL**: See examples in `docs/postman_collections/CURL_EXAMPLES.md`

## License

Private - All rights reserved
