# SentriX - Tactical Talent Reconnaissance System

## Overview

SentriX is a talent reconnaissance visualization platform that displays professional networks as an interactive force-directed graph. The application presents a "tactical" UI theme with a military/cyberpunk aesthetic, allowing users to explore and filter talent nodes, view detailed profile cards with career journeys, and identify exceptional candidates based on various attributes.

The system generates mock data for 1000+ talent nodes with associated metadata including skills, companies, locations, and "exceptional" status indicators. Users can filter between all candidates and exceptional-only views, with profile cards showing overview, journey milestones, and signal data.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with custom tactical/military theme using CSS variables
- **UI Components**: shadcn/ui component library (New York style) with Radix UI primitives
- **Visualization**: react-force-graph-2d with D3.js for force-directed network graphs
- **Animations**: Framer Motion for profile card transitions

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **Build Tool**: esbuild for server bundling, Vite for client
- **API Pattern**: REST endpoints prefixed with `/api`

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Validation**: Zod schemas generated via drizzle-zod
- **Current Storage**: In-memory storage implementation (`MemStorage` class) with interface for future database migration

### Project Structure
```
├── client/src/          # React frontend application
│   ├── components/      # React components including UI library
│   ├── pages/           # Route page components
│   ├── lib/             # Utilities, mock data, query client
│   └── hooks/           # Custom React hooks
├── server/              # Express backend
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Data access layer interface
│   └── static.ts        # Static file serving
├── shared/              # Shared code between client/server
│   └── schema.ts        # Drizzle database schema
└── migrations/          # Drizzle migration files
```

### Build Pipeline
- Development: Vite dev server with HMR, proxying to Express backend
- Production: Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Database migrations: `drizzle-kit push` for schema synchronization

## External Dependencies

### Database
- **PostgreSQL**: Required for production (configured via `DATABASE_URL` environment variable)
- **Drizzle Kit**: Schema management and migrations

### UI/Visualization
- **D3.js**: Force simulation physics for network graph
- **react-force-graph-2d**: Canvas-based 2D force graph rendering
- **Radix UI**: Accessible component primitives (dialog, popover, tabs, etc.)
- **Lucide React**: Icon library

### Development Tools
- **Replit Plugins**: 
  - `@replit/vite-plugin-runtime-error-modal`: Error overlay in development
  - `@replit/vite-plugin-cartographer`: Development tooling
  - `@replit/vite-plugin-dev-banner`: Development environment indicator

### Session/Auth Infrastructure (Available)
- `express-session` with `connect-pg-simple` for PostgreSQL session storage
- `passport` and `passport-local` for authentication (not yet implemented)

### Other Integrations (Packages Installed)
- `@google/generative-ai` and `openai`: AI/LLM integration capability
- `stripe`: Payment processing capability
- `nodemailer`: Email sending capability
- `multer`: File upload handling
- `xlsx`: Spreadsheet processing