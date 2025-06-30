# Job Parser

Japanese job listing parser and viewer web application.

## Features

- Parse Japanese job listings from text files
- Store structured data in PostgreSQL database
- Web interface for viewing and managing entries
- Filter by status, starred items, and search
- Update status, add comments, and star entries

## Tech Stack

- **Backend**: Node.js with Hono framework
- **Database**: PostgreSQL with Drizzle ORM
- **Language**: TypeScript
- **Container**: Docker Compose

## Quick Start

### Using Docker Compose

```bash
# Start the application
docker compose up -d

# Run database migrations
docker compose exec app npm run db:migrate

# Parse a job listings file
docker compose exec app npm run parse /path/to/listings.txt
```

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate database migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript files
- `npm run start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run parse <file>` - Parse job listings from a text file

## File Format

The parser expects text files with job listings separated by `**************************************`.

Example:
```
案件1：フロントエンド開発
会社：株式会社サンプル
商流：元請け
単価：70万円
期間：長期
場所：東京都港区
＜概要＞
React/TypeScriptを使用したWebアプリケーション開発

**************************************

案件2：バックエンド開発
...
```

## API Endpoints

- `GET /` - List all entries with filtering
- `GET /entry/:id` - View entry details
- `POST /entry/:id` - Update entry status/comment/starred
- `GET /health` - Health check
- `PATCH /api/entries/:id` - Update entry (JSON API)
- `POST /api/entries/bulk` - Bulk insert entries