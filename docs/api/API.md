# OpenOrca API Reference

> REST and WebSocket API documentation

---

## Base URL

- Development: `http://localhost:5000`
- Production: TBD

---

## Authentication

Currently: API key validation for Claude endpoints only.
Future: Full authentication system.

---

## REST Endpoints

### Claude Integration

#### Validate API Key
```http
POST /api/claude/validate
Content-Type: application/json

{
  "apiKey": "sk-ant-..."
}
```

**Response:**
```json
{
  "valid": true
}
```

#### Chat (Streaming)
```http
POST /api/claude/chat
Content-Type: application/json

{
  "apiKey": "sk-ant-...",
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "loopContext": {
    "loopName": "feature-build",
    "mode": "forward",
    "goal": "Build user dashboard",
    "status": "running",
    "iterationCount": 5
  }
}
```

**Response:** Server-Sent Events stream
```
data: {"text": "Hello"}
data: {"text": "! How"}
data: {"text": " can I help?"}
data: {"done": true}
```

---

### Knowledge API

#### Health Check
```http
GET /api/knowledge/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

#### Get Stats
```http
GET /api/knowledge/stats
```

**Response:**
```json
{
  "totalNodes": 1250,
  "totalEdges": 3420,
  "nodesByType": {
    "entity": 400,
    "observation": 600,
    "decision": 250
  },
  "edgesByType": {
    "relates_to": 2000,
    "depends_on": 500
  },
  "activeCores": 3,
  "totalCores": 8,
  "lastUpdated": "2026-02-16T08:00:00Z"
}
```

#### Query Knowledge
```http
POST /api/knowledge/query
Content-Type: application/json

{
  "query": "What are the project requirements?",
  "type": "hybrid",
  "cores": ["project-alpha-core"],
  "agentId": "agent-123",
  "maxResults": 10,
  "minConfidence": 0.5,
  "includeRelationships": true
}
```

**Response:**
```json
{
  "answer": "The project requires...",
  "sources": [
    {
      "id": "node-123",
      "type": "fact",
      "content": "Requirement: Support 1000 concurrent users",
      "source": {
        "agentId": "agent-456",
        "timestamp": "2026-02-15T10:00:00Z"
      }
    }
  ],
  "relationships": [
    {
      "id": "edge-789",
      "fromNode": "node-123",
      "toNode": "node-456",
      "relationship": "depends_on",
      "confidence": 0.95
    }
  ],
  "confidence": 0.87,
  "queryType": "hybrid",
  "processingTimeMs": 234
}
```

#### Ingest Knowledge
```http
POST /api/knowledge/ingest
Content-Type: application/json

{
  "agentId": "agent-123",
  "agentName": "Claw-Alpha",
  "taskId": "task-456",
  "content": "Client prefers weekly status updates",
  "type": "observation",
  "metadata": {
    "confidence": "high",
    "source": "meeting-notes"
  },
  "relatedTo": ["node-client-xyz"],
  "relationships": [
    {
      "nodeId": "node-client-xyz",
      "type": "relates_to"
    }
  ]
}
```

**Response:**
```json
{
  "nodeId": "node-new-123",
  "edgesCreated": 1,
  "success": true
}
```

#### Vector Search
```http
POST /api/knowledge/search
Content-Type: application/json

{
  "query": "user authentication",
  "coreId": "development-core",
  "limit": 10
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "node-auth-123",
      "type": "fact",
      "content": "Auth uses JWT tokens with 24h expiry",
      "source": { "agentId": "agent-dev", "timestamp": "..." }
    }
  ]
}
```

#### List Context Cores
```http
GET /api/knowledge/cores
```

**Response:**
```json
{
  "cores": [
    {
      "id": "communications-core",
      "name": "Communications Core",
      "description": "Contact info and preferences",
      "nodeCount": 500,
      "edgeCount": 1200,
      "domains": ["communications"],
      "loadedBy": ["agent-123", "agent-456"],
      "status": "available"
    }
  ]
}
```

#### Get Specific Core
```http
GET /api/knowledge/cores/:coreId
```

#### Create Core
```http
POST /api/knowledge/cores
Content-Type: application/json

{
  "name": "Project Alpha Core",
  "description": "Knowledge for Project Alpha",
  "domains": ["development", "research"]
}
```

#### Load Core for Agent
```http
POST /api/knowledge/cores/:coreId/load
Content-Type: application/json

{
  "agentId": "agent-123"
}
```

#### Unload Core
```http
POST /api/knowledge/cores/:coreId/unload
Content-Type: application/json

{
  "agentId": "agent-123"
}
```

#### Get Related Nodes
```http
GET /api/knowledge/nodes/:nodeId/related?depth=1
```

---

## WebSocket API

### Connection
```javascript
const ws = new WebSocket('ws://localhost:5000/ws');
```

### Events (Server → Client)

#### Agent Status Update
```json
{
  "type": "agent:status",
  "data": {
    "agentId": "agent-123",
    "status": "active",
    "currentAction": "Processing task..."
  }
}
```

#### Task Progress
```json
{
  "type": "task:progress",
  "data": {
    "taskId": "task-456",
    "progress": 75,
    "status": "in_progress"
  }
}
```

#### New Intervention
```json
{
  "type": "intervention:new",
  "data": {
    "id": "intervention-789",
    "agentId": "agent-123",
    "type": "approval_needed",
    "question": "Should I send this email?"
  }
}
```

### Events (Client → Server)

#### Intervention Response
```json
{
  "type": "intervention:respond",
  "data": {
    "interventionId": "intervention-789",
    "response": "approved",
    "note": "Go ahead"
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Errors

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_API_KEY` | 401 | Bad API key |
| `RATE_LIMITED` | 429 | Too many requests |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limits

Currently: No rate limits (development).
Future: Per-agent and per-user limits.

---

## Pagination

For list endpoints, use query parameters:

```
GET /api/agents?limit=20&offset=0
```

---

*Keep this document updated when adding new endpoints.*
