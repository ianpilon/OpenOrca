# OpenOrca Architecture

> System design for the agent fleet command center

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│                    (React + WebSocket)                          │
├─────────────────────────────────────────────────────────────────┤
│                         API Layer                                │
│                    (Express + REST)                             │
├───────────────────┬─────────────────┬───────────────────────────┤
│                   │                 │                           │
│   Agent Service   │ Knowledge Svc   │   Task Service            │
│                   │ (TrustGraph)    │                           │
├───────────────────┴─────────────────┴───────────────────────────┤
│                       Data Layer                                 │
├───────────────────┬─────────────────┬───────────────────────────┤
│    PostgreSQL     │    Cassandra    │       Qdrant              │
│    (Agents,       │    (Graph       │       (Vector             │
│     Tasks)        │     Store)      │        Store)             │
└───────────────────┴─────────────────┴───────────────────────────┘
```

---

## Layer Model

Dependencies flow forward only:

```
Types → Config → Repository → Service → Runtime → UI
```

### Types Layer
- Pure type definitions
- No runtime code
- Shared between client/server
- Location: `shared/`, `*/types.ts`

### Config Layer
- Static configuration
- Environment variables
- Feature flags
- Location: `*/config/`

### Repository Layer
- Data access
- Database queries
- External API calls
- Location: `server/storage.ts`, `server/knowledge/client.ts`

### Service Layer
- Business logic
- Orchestration
- Domain rules
- Location: `server/routes.ts` (to be refactored)

### Runtime Layer
- Server initialization
- WebSocket setup
- Middleware
- Location: `server/index.ts`, `server/voice.ts`

### UI Layer
- React components
- User interaction
- Visual presentation
- Location: `client/src/`

---

## Domain Model

### Core Entities

```typescript
// Agent - AI instance running on a machine
interface ClawAgent {
  id: string;
  name: string;
  machineId: string;
  status: AgentStatus;
  domain: AgentDomain;
  integrations: Integration[];
  // Economic fields
  loadedCores: string[];
  knowledgeContributions: number;
  graphAccess: 'read' | 'write' | 'admin';
}

// Task - Work assigned to an agent
interface AgentTask {
  id: string;
  agentId: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
}

// Swarm - Multi-agent collaboration
interface Swarm {
  id: string;
  name: string;
  objective: string;
  agents: string[];
  leadAgentId: string;
  status: SwarmStatus;
}

// Intervention - Human input needed
interface Intervention {
  id: string;
  agentId: string;
  type: InterventionType;
  question: string;
  context: string;
  priority: TaskPriority;
}
```

### Knowledge Entities

```typescript
// Node in knowledge graph
interface KnowledgeNode {
  id: string;
  type: NodeType;
  content: string;
  source: { agentId: string; timestamp: string; };
}

// Edge connecting nodes
interface KnowledgeEdge {
  id: string;
  fromNode: string;
  toNode: string;
  relationship: RelationType;
  confidence: number;
}

// Reusable knowledge package
interface ContextCore {
  id: string;
  name: string;
  domains: string[];
  nodeCount: number;
  loadedBy: string[];
}
```

---

## Service Boundaries

### Agent Service
- Agent CRUD operations
- Status management
- Integration tracking
- Machine assignment

### Knowledge Service
- TrustGraph API wrapper
- Context Core management
- Query/ingest operations
- Knowledge stats

### Task Service
- Task assignment
- Progress tracking
- Quality evaluation
- Payment calculation (future)

### Task Execution Engine (Cascading Protocol)
- Contract-based task orchestration
- Input/output validation gates
- Backpressure handling on validation failure
- Self-testing at each task boundary
- See: `docs/plans/active/cascading-protocol.md`

### Intervention Service
- Request creation
- Human response handling
- Priority management
- Escalation logic

---

## API Design

### REST Endpoints

| Method | Path | Service |
|--------|------|---------|
| GET | `/api/agents` | Agent |
| GET | `/api/tasks` | Task |
| GET | `/api/swarms` | Agent |
| GET | `/api/interventions` | Intervention |
| POST | `/api/knowledge/query` | Knowledge |
| POST | `/api/knowledge/ingest` | Knowledge |
| GET | `/api/knowledge/cores` | Knowledge |
| POST | `/api/claude/chat` | External |

### WebSocket Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `agent:status` | Server→Client | Status updates |
| `task:progress` | Server→Client | Task progress |
| `intervention:new` | Server→Client | New intervention |
| `voice:audio` | Bidirectional | Voice streaming |

---

## Data Flow

### Agent Status Update
```
External Agent → WebSocket → Runtime → Service → Repository → Database
                                                      ↓
                                           WebSocket broadcast
                                                      ↓
                                                 UI Update
```

### Knowledge Query
```
UI → API → Knowledge Service → TrustGraph Client → TrustGraph API
                                                         ↓
                                                   Cassandra + Qdrant
                                                         ↓
                                              GraphRAG response
                                                         ↓
                                                    UI Display
```

---

## Cross-Cutting Concerns

### Authentication
- API key validation for Claude
- Future: Agent authentication
- Future: User authentication

### Logging
- Structured logging required
- Request/response logging
- Error tracking

### Observability
- Future: Prometheus metrics
- Future: Grafana dashboards
- Future: Agent accessible metrics

---

## Future Architecture

### Phase 1: Current + TrustGraph
- Basic knowledge integration
- Manual agent management

### Phase 1.5: Cascading Protocol
- Task contract schemas (input/output)
- Validation gates between tasks
- Basic backpressure/retry logic
- Task graph execution engine

### Phase 2: Economic Layer
- Cost tracking per agent
- Revenue tracking
- Survival status

### Phase 3: Task Marketplace
- External task sources
- Quality evaluation
- Automatic assignment
- ML-based validation (learn from history)

### Phase 4: Self-Sustaining
- Agents pay for compute
- Automatic task acquisition
- Profit reinvestment

---

## Invariants

1. **No circular dependencies** — Layers only depend on lower layers
2. **Boundary validation** — Parse data at service boundaries
3. **Single responsibility** — One service per domain
4. **Explicit contracts** — Typed API responses
5. **Isolation** — Agents get isolated environments

---

*This document is the source of truth for system architecture.*
*Update it when architecture changes.*
