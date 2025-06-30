# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a job listing parser and viewer web application for Japanese job listings (案件情報). The system parses text-based job listings, stores them in a database, and provides a web interface for viewing and managing entries.

## Technology Stack

- **Framework**: HonoX (Hono with file-based routing and islands architecture)
- **Database**: PostgreSQL with Drizzle ORM
- **Containerization**: Docker Compose
- **Language**: TypeScript with JSX
- **Build Tool**: Vite

## Common Development Commands

### Development
```bash
# Run development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Parse job listings file
npm run parse <file-path>
```

### Database
```bash
# Generate database migrations
npm run db:generate

# Run database migrations
npm run db:migrate

# Open Drizzle Studio for database management
npm run db:studio
```

### Docker
```bash
# Start all services
docker compose up -d

# Run migrations in Docker
docker compose exec app npm run db:migrate

# View logs
docker compose logs -f app
```

## Architecture

### Core Components

1. **Parser Module** (`src/parser/`): Extracts structured data from text files containing job listings
   - Handles multiple entries separated by `**************************************`
   - Extracts fields like title, company, price, location, requirements, etc.
   - Provides error handling for malformed entries

2. **Database Layer** (`src/db/`): PostgreSQL with Drizzle ORM
   - Main table: `entries` with fields for all job listing data
   - Status tracking: new, reviewed, rejected
   - Support for comments and starring

3. **API Layer** (`src/api/`): RESTful API endpoints
   - `/api/entries/:id` - Update entry (PATCH)
   - `/api/health` - Health check endpoint

4. **Web Application** (`src/web/`): HonoX with islands architecture
   - File-based routing in `src/web/routes/`
   - Static components in `src/web/components/` for server-side rendering
   - Island components in `src/web/islands/` for client-side interactivity
   - `/` - List view with filtering and sorting
   - `/entry/:id` - Detail view with editing capabilities

### Database Schema

The `entries` table contains:
- Basic info: title, company, distribution, price, period, location
- Details: billing, interview, time, notes
- Content: description, requirements, preferences, tech_stack
- Metadata: status, comment, starred, created_at, updated_at

### Docker Setup

The application runs in Docker with:
- Node.js app container on port 8787
- PostgreSQL database container
- Volume mounts for development

## Development Guidelines

1. **Parser Implementation**: Use regex patterns with fallback heuristics for field extraction
2. **Error Handling**: Implement structured error reporting for parse failures
3. **Database Operations**: Use Drizzle ORM for type-safe database access
4. **API Design**: Follow RESTful patterns with Hono framework
5. **Testing**: Write tests for parser logic and API endpoints

## File Structure

```
src/
  api/           # API endpoints
    index.ts     # API router with all endpoints
  db/            # Database layer
    index.ts     # Database connection and exports
    schema.ts    # Drizzle ORM schema definitions
    migrate.ts   # Migration runner script
  parser/        # Text parsing logic
    index.ts     # JobListingParser class
    types.ts     # TypeScript types for parser
  scripts/       # Utility scripts
    parse.ts     # CLI script for parsing files
    test-parse.ts # Parser test script
  web/           # HonoX web application
    server.ts    # Server entry point
    client.tsx   # Client entry point
    routes/      # File-based routing
      _renderer.tsx    # Layout wrapper
      index.tsx        # List view page
      entry/[id].tsx   # Detail view page
    components/  # Server-side components
      EntryList.tsx    # Static entry list
      EntryDetail.tsx  # Static entry details
    islands/     # Client-side interactive components
      FilterForm.tsx   # Interactive filter form
      EntryActions.tsx # Interactive entry actions
drizzle/         # Generated migration files
vite.config.ts   # Vite configuration
compose.yaml     # Docker Compose configuration
```

## Key Libraries Used

- **HonoX**: Meta-framework for Hono with file-based routing and islands architecture
- **Hono**: Modern web framework with excellent TypeScript support
- **Drizzle ORM**: Type-safe ORM with automatic migrations
- **Zod**: Runtime type validation for API inputs
- **Postgres.js**: Fast PostgreSQL client for Node.js
- **Vite**: Fast build tool with HMR support
- **TSX**: TypeScript execution for development

## Islands Architecture

HonoX uses islands architecture where:
- Most components are server-rendered for better performance
- Interactive components are "islands" that hydrate on the client
- Islands are placed in `src/web/islands/` directory
- Static components go in `src/web/components/` directory

This approach provides:
- Better initial page load performance
- Reduced JavaScript bundle size
- Progressive enhancement
- SEO-friendly server-side rendering