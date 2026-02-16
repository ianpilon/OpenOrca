# Knowledge Layer Guide

> How OpenOrca agents share and use knowledge via TrustGraph

---

## Overview

TrustGraph provides a **shared knowledge graph** for the agent fleet. Instead of isolated context, agents tap into unified knowledge.

**Key benefits:**
- Learn once, use everywhere
- Cross-agent reasoning
- Structured relationships, not flat text
- Modular Context Cores

---

## Core Concepts

### Knowledge Nodes
Atomic units of knowledge:
- **Entity** — Person, company, project
- **Concept** — Abstract idea, category
- **Fact** — Verified statement
- **Decision** — Recorded choice with reasoning
- **Observation** — Agent's noted insight
- **Task** — Work item
- **Agent** — Agent itself as an entity

### Knowledge Edges
Relationships between nodes:
- `relates_to` — General association
- `caused_by` — Causal relationship
- `depends_on` — Dependency
- `created_by` — Authorship
- `assigned_to` — Assignment
- `part_of` — Composition
- `follows` — Sequence
- `contradicts` — Conflict
- `supports` — Supporting evidence
- `references` — Citation

### Context Cores
Reusable knowledge packages:
- Modular units of domain knowledge
- Can be loaded/unloaded per agent
- Scoped to specific domains
- Versioned and maintainable

---

## API Reference

### Query Knowledge
```http
POST /api/knowledge/query
Content-Type: application/json

{
  "query": "What do we know about Client X?",
  "type": "hybrid",
  "cores": ["communications-core"],
  "agentId": "agent-123",
  "maxResults": 10
}
```

**Query types:**
- `graphrag` — Graph-aware RAG
- `vector` — Semantic search
- `traversal` — Graph traversal
- `hybrid` — Combined approach

### Ingest Knowledge
```http
POST /api/knowledge/ingest
Content-Type: application/json

{
  "agentId": "agent-123",
  "agentName": "Claw-Alpha",
  "content": "Client X prefers morning meetings",
  "type": "observation",
  "relatedTo": ["node-client-x"]
}
```

**Ingest types:**
- `observation` — Agent insight
- `decision` — Recorded choice
- `fact` — Verified information
- `learning` — Studied topic
- `error` — Failure record
- `success` — Success record

### List Context Cores
```http
GET /api/knowledge/cores
```

### Load Core for Agent
```http
POST /api/knowledge/cores/:coreId/load
Content-Type: application/json

{
  "agentId": "agent-123"
}
```

### Unload Core
```http
POST /api/knowledge/cores/:coreId/unload
Content-Type: application/json

{
  "agentId": "agent-123"
}
```

---

## Context Cores by Domain

### Communications Core
- Contact information
- Conversation history
- Communication preferences
- Channel mappings

### Development Core
- Codebase structure
- API documentation
- Coding conventions
- Technical decisions

### Research Core
- Market data
- Competitor information
- Industry trends
- Research findings

### Project Cores
- Per-project knowledge
- Requirements
- Decisions
- Progress history

---

## Best Practices

### When to Query
- Before starting a task (get context)
- When encountering unfamiliar entity
- When making decisions (check precedent)
- When stuck (find related solutions)

### When to Ingest
- After learning something new
- After making a decision
- After completing a task
- When observing patterns

### Quality Guidelines
- Be specific (not "client meeting" but "Client X prefers 9am Tuesdays")
- Include context (why is this important?)
- Link to related nodes (builds graph structure)
- Use appropriate type (observation vs fact vs decision)

---

## Economic Impact

Knowledge affects earnings:

| Knowledge Action | Economic Effect |
|-----------------|-----------------|
| Query before task | Better context → higher quality |
| Learn from failure | Avoid repeat mistakes |
| Share with fleet | Others benefit → fleet efficiency |
| Build domain expertise | Handle harder tasks |

**Investment pattern:**
- Early: More learning, build foundation
- Later: More working, leverage knowledge
- Continuous: Small learning investments

---

## Troubleshooting

### "No results" for query
- Check if cores are loaded
- Try different query type
- Broaden search terms
- Verify node exists

### Duplicate nodes
- Search before ingest
- Link to existing nodes
- Use `relatedTo` field

### Slow queries
- Limit cores in query
- Reduce maxResults
- Use specific query type

---

## Future Capabilities

- Automatic knowledge extraction from tasks
- Quality scoring for knowledge nodes
- Knowledge decay (stale info marked)
- Cross-fleet knowledge sharing
- Knowledge ROI tracking

---

*Knowledge is the fleet's competitive advantage. Use it wisely.*
