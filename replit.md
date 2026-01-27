# Loom - Agents-First Infrastructure Orchestrator

## Overview

Loom is an infrastructure orchestration visualization platform designed around the "agents-first, humans-second" paradigm. It displays Ralph loops (recursive AI coding agent loops) as animated spinning cycles, with human intervention surfaces that only appear when agents encounter failure domains requiring guidance.

The system implements the Loom philosophy where:
- **Ralph Loops** are the primary focus: Forward mode (building), Reverse mode (cloning), System mode (testing)
- **Threads** are audit trails of everything agents do, shareable and loadable as context
- **Weavers** are the agents themselves, running with full isolation
- **Software is Clay** - get it working, then run more loops to refine

Users can observe loops spinning in real-time, track thread decision histories, resolve interventions when needed, and monitor system health with push-to-main confidence indicators.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2026)

- **Complete UI Paradigm Shift**: Transformed from network-graph talent visualization to Loom agents-first infrastructure
- **New Components Added**:
  - `LoopVisualization` - Animated loop orbits with wheel-speed indicators
  - `ThreadTimeline` - Audit trail navigation with fork points
  - `LoopStream` - Real-time loop execution view
  - `InterventionPanel` - Exception-only human controls
  - `ThreadInspector` - Detailed loop/thread inspection
  - `RefinementHistory` - Clay metaphor with iteration tracking
  - `SafeguardDashboard` - Push-to-main confidence display
- **New Data Model**: `loomData.ts` with Ralph loops, threads, weavers, failure domains, safeguards
- **CSS Animations**: Loop spinning, clay textures, intervention glow effects

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS v4 with tactical/HUD theme using CSS variables
- **UI Components**: shadcn/ui component library (New York style) with Radix UI primitives
- **Visualization**: Custom canvas-based loop animation with SVG overlays
- **Animations**: Framer Motion for component transitions and loop spinning

### Core UI Components

```
├── LoopVisualization.tsx    # Main canvas with spinning Ralph loops in orbital paths
├── ThreadTimeline.tsx       # Left sidebar showing thread audit trails with fork points
├── LoopStream.tsx           # Bottom panel with real-time loop execution cards
├── InterventionPanel.tsx    # Right overlay for human intervention (only when needed)
├── ThreadInspector.tsx      # Detail panel for selected loop/thread
├── RefinementHistory.tsx    # Bottom-left clay metaphor visualization
├── SafeguardDashboard.tsx   # Bottom-right system health and safeguard status
```

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **Build Tool**: esbuild for server bundling, Vite for client
- **API Pattern**: REST endpoints prefixed with `/api`

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Validation**: Zod schemas generated via drizzle-zod
- **Current Storage**: In-memory mock data generation (`loomData.ts`)

### Project Structure
```
├── client/src/
│   ├── components/          # React components
│   │   ├── LoopVisualization.tsx
│   │   ├── ThreadTimeline.tsx
│   │   ├── LoopStream.tsx
│   │   ├── InterventionPanel.tsx
│   │   ├── ThreadInspector.tsx
│   │   ├── RefinementHistory.tsx
│   │   ├── SafeguardDashboard.tsx
│   │   └── ui/              # shadcn/ui primitives
│   ├── pages/
│   │   └── Home.tsx         # Main Loom dashboard
│   ├── lib/
│   │   ├── loomData.ts      # Loom data models and mock generation
│   │   └── mockData.ts      # Legacy data (can be removed)
│   └── hooks/
├── server/
│   ├── routes.ts
│   ├── storage.ts
│   └── static.ts
├── shared/
│   └── schema.ts
└── migrations/
```

### Key Data Types (loomData.ts)

- **RalphLoop**: Core loop entity with mode, status, wheelSpeed, refinementLevel
- **Thread**: Audit trail with decisions, fork points, safeguards
- **Weaver**: Agent entity with isolation level, uptime, loops completed
- **FailureDomain**: Areas requiring human guidance (security, architecture, etc.)
- **Safeguard**: Engineering solutions (rollback, feature flags, health checks)
- **SystemHealth**: Overall deployment confidence metrics

### Visual Language

- **Green (Emerald)**: Autonomous operations, spinning loops, healthy systems
- **Amber/Orange**: Intervention required, waiting states, warnings
- **Purple**: Fork points, thread operations, refinement levels
- **Blue (Primary)**: Primary actions, completed states, UI accents

### Build Pipeline
- Development: Vite dev server with HMR, proxying to Express backend
- Production: Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Database migrations: `drizzle-kit push` for schema synchronization

## External Dependencies

### UI/Visualization
- **Framer Motion**: Animation for loop spinning and component transitions
- **Radix UI**: Accessible component primitives
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
