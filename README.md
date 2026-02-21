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

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://hometasks:...` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | API server port | `3000` |
| `JWT_ACCESS_SECRET` | JWT access token secret | (to be configured) |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | (to be configured) |

## Docker Services

### PostgreSQL
- **Container:** hometasks-postgres
- **Port:** 5432
- **User:** hometasks
- **Password:** hometasks_dev_password
- **Database:** hometasks_dev

### pgAdmin
- **Container:** hometasks-pgadmin
- **URL:** http://localhost:5050
- **Email:** admin@hometasks.local
- **Password:** admin

## Development Workflow

1. Make changes to the code
2. The server will automatically reload (watch mode)
3. If you modify the Prisma schema:
   ```bash
   npx prisma migrate dev --name <migration-name>
   ```
4. Commit your changes following conventional commits

## License

Private - All rights reserved
