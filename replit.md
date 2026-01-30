# Claw Orchestrator - OpenClaw Fleet Command Center

## Overview

Claw Orchestrator is a command center for managing multiple OpenClaw AI agents across different machines and domains. It provides real-time visualization of your AI agent fleet, allowing you to monitor, control, and coordinate agents working on communications, productivity, research, development, and automation tasks.

The system implements the OpenClaw philosophy where:
- **Agents** are personal AI assistants running on your machines (Mac, Windows, Linux, Android)
- **Domains** organize agents by task type: Communications, Productivity, Research, Development, Automation
- **Swarms** enable multiple agents to collaborate on complex objectives
- **Interventions** appear when agents need human approval or guidance

Users can observe their fleet of claw agents bouncing and working in real-time, track action logs, resolve intervention requests, and monitor fleet health across all connected machines.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2026)

- **OpenClaw Fleet Paradigm**: Complete shift from Ralph loops to OpenClaw agent fleet management
- **New Data Model** (`clawData.ts`):
  - `ClawAgent` - Personal AI agent with machine, domain, integrations, status
  - `AgentTask` - Tasks assigned to agents with progress tracking
  - `ActionEntry` - Audit log of agent actions (emails sent, files modified, browser actions)
  - `Swarm` - Multi-agent collaboration groups
  - `Intervention` - Human approval requests
  - `Machine` - Devices running agents
  - `FleetHealth` - Overall system status
- **New Components**:
  - `AgentVisualization` - Canvas with bouncing claw agents organized by domain orbits
  - `ActionTimeline` - Left sidebar showing agent action log
  - `AgentStream` - Bottom panel with agent cards and progress
  - `AgentInterventionPanel` - Right panel for approval requests
  - `AgentInspector` - Detailed agent view with stats and actions
  - `SwarmDashboard` - Multi-agent collaboration tracking
  - `FleetHealthPanel` - Fleet status and machine health
- **Domain-Based Organization**: Agents organized in orbital rings by domain:
  - Inner: Communications (pink)
  - Middle-Inner: Productivity (blue)
  - Middle: Research (purple)
  - Middle-Outer: Development (green)
  - Outer: Automation (amber)
- **Integration Badges**: Visual indicators for WhatsApp, Telegram, Discord, Browser, Files, etc.
- **Claw Agent Character**: Cute red mascot represents each agent

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS v4 with tactical/HUD theme using CSS variables
- **UI Components**: shadcn/ui component library (New York style) with Radix UI primitives
- **Visualization**: Custom canvas-based agent visualization with SVG overlays
- **Animations**: Framer Motion for component transitions and agent bouncing

### Core UI Components

```
├── AgentVisualization.tsx   # Main canvas with bouncing claw agents in domain orbits
├── ActionTimeline.tsx       # Left sidebar showing agent action log
├── AgentStream.tsx          # Bottom panel with agent cards and controls
├── AgentInterventionPanel.tsx # Right overlay for approval requests
├── AgentInspector.tsx       # Detail panel for selected agent
├── SwarmDashboard.tsx       # Multi-agent collaboration view
├── FleetHealthPanel.tsx     # System health and machine status
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
- **Current Storage**: In-memory mock data generation (`clawData.ts`)

### Project Structure
```
├── client/src/
│   ├── components/
│   │   ├── AgentVisualization.tsx
│   │   ├── ActionTimeline.tsx
│   │   ├── AgentStream.tsx
│   │   ├── AgentInterventionPanel.tsx
│   │   ├── AgentInspector.tsx
│   │   ├── SwarmDashboard.tsx
│   │   ├── FleetHealthPanel.tsx
│   │   └── ui/              # shadcn/ui primitives
│   ├── pages/
│   │   └── Home.tsx         # Main Claw Orchestrator dashboard
│   ├── lib/
│   │   ├── clawData.ts      # OpenClaw agent data models and mock generation
│   │   └── loomData.ts      # Legacy data (kept for reference)
│   ├── assets/
│   │   └── images/
│   │       └── claw-agent.png  # Claw character image
│   └── hooks/
├── server/
│   ├── routes.ts
│   ├── storage.ts
│   └── static.ts
├── shared/
│   └── schema.ts
└── migrations/
```

### Key Data Types (clawData.ts)

- **ClawAgent**: Agent entity with domain, integrations, machine, status, activity level
- **AgentTask**: Task with progress, priority, integrations used
- **ActionEntry**: Log entry (email_sent, message_sent, file_modified, browser_action, etc.)
- **Swarm**: Multi-agent collaboration with objective, progress, lead agent
- **Intervention**: Approval request with type, question, context, options
- **Machine**: Device info with OS, location, online status
- **FleetHealth**: Overall fleet metrics (active, offline, interventions, tasks)

### Agent Domains

- **Communications** (Pink): Email, WhatsApp, Telegram, Discord, Slack, Signal
- **Productivity** (Blue): Calendar, notes, files, task management
- **Research** (Purple): Browser, web search, data analysis
- **Development** (Green): Terminal, GitHub, code files
- **Automation** (Amber): Scheduled tasks, workflows, batch jobs

### Visual Language

- **Red/Pink**: Claw agents, communications domain
- **Green (Emerald)**: Active agents, development domain
- **Amber/Orange**: Interventions required, automation domain
- **Purple**: Swarms, research domain, collaborations
- **Blue**: Productivity domain, primary actions

### Build Pipeline
- Development: Vite dev server with HMR, proxying to Express backend
- Production: Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Database migrations: `drizzle-kit push` for schema synchronization

## External Dependencies

### UI/Visualization
- **Framer Motion**: Animation for agent bouncing and component transitions
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
