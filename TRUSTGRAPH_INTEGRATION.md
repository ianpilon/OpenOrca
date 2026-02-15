# TrustGraph Integration for OpenOrca

## Overview

Integrating TrustGraph as the **shared knowledge layer** for OpenOrca's agent fleet. Instead of agents operating with isolated context, they'll tap into a unified knowledge graph.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     OpenOrca Dashboard                       │
│  (React UI - Agent Viz, Swarms, Interventions, Knowledge)   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    OpenOrca Backend                          │
│              (Express + WebSocket + Knowledge API)           │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌──────────┐    ┌──────────┐    ┌──────────┐
       │ PostgreSQL│    │TrustGraph│    │  Agents  │
       │ (Agents, │    │ (Knowledge│    │ (External│
       │  Tasks)  │    │   Graph)  │    │  Claw    │
       └──────────┘    └──────────┘    │ Instances)│
                              │        └──────────┘
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌──────────┐    ┌──────────┐    ┌──────────┐
       │ Cassandra │    │  Qdrant  │    │  Garage  │
       │ (Graph   │    │ (Vector  │    │ (Object  │
       │  Store)  │    │   DB)    │    │  Store)  │
       └──────────┘    └──────────┘    └──────────┘
```

## What TrustGraph Adds

### 1. Shared Context Graph
Every agent writes observations/learnings to the graph:
- Research agent finds market data → writes to graph
- Development agent needs context → queries graph
- No manual sync needed

### 2. Context Cores (Modular Knowledge)
Reusable knowledge bases that agents can load/unload:
- `communications-core` - Contact info, conversation history, preferences
- `development-core` - Codebase structure, APIs, conventions
- `research-core` - Market data, competitor info, articles
- `project-core` - Project-specific knowledge

### 3. GraphRAG for Agents
Instead of flat RAG chunks, agents get structured context:
- "What do we know about Client X?" → traverses relationships
- "What depends on Service Y?" → graph query
- "Who worked on Feature Z?" → connected context

### 4. Cross-Agent Reasoning
Agent A learns something → in graph immediately → Agent B uses it

## Implementation Phases

### Phase 1: Infrastructure (Docker Setup)
- [ ] Add TrustGraph services to docker-compose
- [ ] Configure Cassandra + Qdrant + Garage
- [ ] Set up TrustGraph Workbench on port 8888
- [ ] Health checks and startup dependencies

### Phase 2: Knowledge API Layer
- [ ] Create `server/knowledge/` module
- [ ] Wrap TrustGraph client APIs
- [ ] Add endpoints:
  - `POST /api/knowledge/query` - GraphRAG queries
  - `POST /api/knowledge/ingest` - Add data to graph
  - `GET /api/knowledge/cores` - List context cores
  - `POST /api/knowledge/cores/:id/load` - Load a core
  - `DELETE /api/knowledge/cores/:id/unload` - Unload a core

### Phase 3: Agent Integration
- [ ] Add `knowledgeContext` to ClawAgent type
- [ ] Agents can specify which Context Cores they need
- [ ] Actions that write to knowledge graph
- [ ] Actions that query knowledge graph

### Phase 4: UI Components
- [ ] Knowledge Graph Visualizer (use TrustGraph's 3D viz)
- [ ] Context Core Manager (load/unload, view contents)
- [ ] Agent Knowledge Panel (what does this agent know?)
- [ ] Swarm Shared Context view

### Phase 5: Ontologies & Schemas
- [ ] Define OpenOrca ontology for agent knowledge
- [ ] Schema for tasks, decisions, learnings
- [ ] Cross-agent relationship types

## Data Model Additions

### Extended ClawAgent
```typescript
interface ClawAgent {
  // ... existing fields ...
  
  // Knowledge layer
  loadedCores: string[];           // Context Cores this agent has loaded
  knowledgeContributions: number;  // How much has this agent added to graph
  lastGraphQuery: string;          // Last thing it asked the graph
  graphAccess: 'read' | 'write' | 'admin';
}
```

### Knowledge Types
```typescript
interface KnowledgeNode {
  id: string;
  type: 'entity' | 'concept' | 'fact' | 'decision' | 'observation';
  content: string;
  source: {
    agentId: string;
    taskId?: string;
    timestamp: string;
  };
  embeddings?: number[];
}

interface KnowledgeEdge {
  id: string;
  fromNode: string;
  toNode: string;
  relationship: string;  // 'relates_to', 'caused_by', 'depends_on', etc.
  confidence: number;
  source: {
    agentId: string;
    timestamp: string;
  };
}

interface ContextCore {
  id: string;
  name: string;
  description: string;
  nodeCount: number;
  edgeCount: number;
  domains: AgentDomain[];
  loadedBy: string[];  // Agent IDs that have this core loaded
}
```

## API Contracts

### Query Knowledge
```typescript
// POST /api/knowledge/query
interface KnowledgeQuery {
  query: string;
  type: 'graphrag' | 'vector' | 'traversal';
  cores?: string[];        // Limit to specific cores
  agentId?: string;        // Context of asking agent
  maxResults?: number;
}

interface KnowledgeQueryResult {
  answer: string;
  sources: KnowledgeNode[];
  relationships: KnowledgeEdge[];
  confidence: number;
}
```

### Ingest Knowledge
```typescript
// POST /api/knowledge/ingest
interface KnowledgeIngest {
  agentId: string;
  content: string;
  type: 'observation' | 'decision' | 'fact' | 'learning';
  metadata?: Record<string, any>;
  relatedTo?: string[];    // Existing node IDs to link to
}
```

## Docker Compose Additions

```yaml
services:
  # ... existing services ...

  trustgraph:
    image: trustgraph/workbench:latest
    ports:
      - "8888:8888"
    depends_on:
      - cassandra
      - qdrant
    environment:
      - GRAPH_STORE=cassandra
      - VECTOR_STORE=qdrant

  cassandra:
    image: cassandra:4
    ports:
      - "9042:9042"
    volumes:
      - cassandra_data:/var/lib/cassandra

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

  garage:
    image: dxflrs/garage:v0.9
    ports:
      - "3900:3900"
    volumes:
      - garage_data:/var/lib/garage

volumes:
  cassandra_data:
  qdrant_data:
  garage_data:
```

## Usage Scenarios

### Scenario 1: Research Agent Learns Something
1. Research agent finds: "Competitor X launched new product Y"
2. Agent calls `POST /api/knowledge/ingest` with observation
3. Graph creates node + links to existing "Competitor X" entity
4. Other agents can now query for competitor info

### Scenario 2: Development Agent Needs Context
1. Dev agent working on feature for Client Z
2. Queries: "What are Client Z's requirements?"
3. GraphRAG traverses: Client Z → Projects → Requirements
4. Returns structured context, not just text chunks

### Scenario 3: Swarm Collaboration
1. Swarm formed for "Market Analysis"
2. All swarm agents load `research-core`
3. Research agent adds findings to graph
4. Analysis agent queries findings
5. Report agent compiles from shared context

## Next Steps

1. Start with Phase 1 - get TrustGraph running alongside OpenOrca
2. Build minimal Knowledge API
3. Wire up one agent to write/read from graph
4. Expand from there

---

*This integration transforms OpenOrca from "agents with isolated context" to "agents with shared understanding."*
