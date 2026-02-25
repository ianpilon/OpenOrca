# Cascading Protocol Design

*Implementing contract-based task orchestration with validation gates*

---

## Overview

The Cascading Protocol addresses the "copy of a copy" problem in multi-step agent tasks where context and intent degrade across task boundaries. By enforcing explicit input/output contracts and validation gates, we catch errors early and prevent cascading failures.

---

## Part 1: For Ren (Personal Agent Architecture)

### Current State
- Memory files for persistence (MEMORY.md, daily logs)
- Sub-agent spawning for parallel work
- Compaction for context management
- No formal task contracts or validation

### Proposed Protocol

#### Task Decomposition Format
When I receive a complex task, decompose it explicitly:

```markdown
## Task Decomposition: [Goal]

### T1: [First Subtask]
- **Input Required:** [what I need to start]
- **Output Expected:** [what success looks like]
- **Validation:** [how to verify completion]

### T2: [Second Subtask]  
- **Input Required:** [output from T1]
- **Output Expected:** [deliverable]
- **Validation:** [verification method]

### Dependencies: T1 → T2 → T3
```

#### Execution Protocol

1. **Before starting Task N:**
   - Verify I have the required input
   - If input is from previous task, validate it meets schema
   - If invalid: stop, report what's missing/wrong

2. **After completing Task N:**
   - Run self-test against expected output
   - Document actual output explicitly
   - Only signal ready for Task N+1 if validation passes

3. **On validation failure:**
   - Don't proceed to next task
   - Report: what failed, why, what's needed to fix
   - Re-attempt with corrections OR escalate to user

#### Example Application

**User Request:** "Research X, create a summary, then draft an email"

**Decomposition:**
```
T1: Research X
  Input: Topic name, scope
  Output: 5-10 key findings with sources
  Validate: Each finding has citation, covers scope

T2: Create Summary  
  Input: Validated findings from T1
  Output: 2-paragraph summary hitting main points
  Validate: Summary references all key findings, no hallucinated facts

T3: Draft Email
  Input: Validated summary from T2
  Output: Professional email with summary embedded
  Validate: Email is complete, tone appropriate, summary intact
```

**Execution:**
- T1 completes → self-test: "Do I have 5-10 findings with sources?" → Yes → proceed
- T2 starts → validate input: "Are these findings sourced?" → Yes → execute
- T2 completes → self-test: "Does summary cover all findings?" → Yes → proceed
- T3 starts → validate input: "Is summary coherent?" → Yes → execute → done

---

## Part 2: For OpenOrca (Multi-Agent Orchestration)

### Architecture Integration

The Cascading Protocol fits into OpenOrca's orchestration layer as a **Task Execution Engine**.

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Task Execution Engine                   │    │
│  │  ┌─────────┐    ┌─────────┐    ┌─────────┐         │    │
│  │  │ Task 1  │───▶│ Task 2  │───▶│ Task 3  │         │    │
│  │  │         │    │         │    │         │         │    │
│  │  │ Valid?  │    │ Valid?  │    │ Valid?  │         │    │
│  │  └────┬────┘    └────┬────┘    └────┬────┘         │    │
│  │       │              │              │               │    │
│  │       ▼              ▼              ▼               │    │
│  │  [Validation Gate] [Validation Gate] [Output]       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Agent A  │  │ Agent B  │  │ Agent C  │                  │
│  │ (exec)   │  │ (exec)   │  │ (exec)   │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Schema Definitions

```typescript
interface TaskContract {
  id: string;
  name: string;
  description: string;
  
  // Input contract
  inputSchema: {
    required: Field[];
    optional?: Field[];
  };
  
  // Output contract  
  outputSchema: {
    required: Field[];
    optional?: Field[];
  };
  
  // Validation
  validateInput: (input: unknown) => ValidationResult;
  validateOutput: (output: unknown) => ValidationResult;
  selfTest: (output: unknown) => TestResult;
  
  // Execution
  assignedAgent?: string;
  timeout?: number;
  retryPolicy?: RetryPolicy;
}

interface Field {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  validation?: (value: unknown) => boolean;
}

interface ValidationResult {
  valid: boolean;
  errors?: string[];
  suggestions?: string[];
}

interface TestResult {
  passed: boolean;
  coverage: number; // 0-1, how much of expected output was produced
  issues?: string[];
}

interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
  escalateAfter?: number; // escalate to human after N failures
}
```

### Task Graph Execution

```typescript
interface TaskGraph {
  tasks: TaskContract[];
  edges: TaskEdge[]; // dependencies
  
  // Execution state
  status: Map<string, 'pending' | 'running' | 'validating' | 'complete' | 'failed'>;
  outputs: Map<string, unknown>;
  
  // Methods
  canStart(taskId: string): boolean;
  execute(taskId: string): Promise<ExecutionResult>;
  validateTransition(fromId: string, toId: string): ValidationResult;
}

interface TaskEdge {
  from: string;
  to: string;
  outputMapping?: Record<string, string>; // map output fields to input fields
}
```

### Execution Flow

```
1. DECOMPOSE
   User goal → TaskGraph with contracts

2. SCHEDULE  
   Find tasks with no unmet dependencies
   
3. EXECUTE (for each ready task)
   a. Validate input (from previous task outputs)
   b. If invalid → backpressure (retry previous or escalate)
   c. Assign to agent
   d. Agent executes
   e. Agent runs self-test
   f. Orchestrator validates output
   g. If invalid → retry with feedback OR escalate
   h. If valid → mark complete, unlock dependents

4. REPEAT until all tasks complete or max retries exceeded

5. AGGREGATE
   Combine outputs into final deliverable
```

### Backpressure Handling

```typescript
async function handleValidationFailure(
  task: TaskContract,
  result: ValidationResult,
  attempt: number
): Promise<Action> {
  
  if (attempt >= task.retryPolicy.maxAttempts) {
    return { type: 'escalate', reason: result.errors };
  }
  
  // Build correction prompt
  const feedback = `
    Task "${task.name}" output validation failed.
    Errors: ${result.errors.join(', ')}
    Suggestions: ${result.suggestions?.join(', ')}
    
    Please re-attempt with corrections.
  `;
  
  return { 
    type: 'retry', 
    feedback,
    delay: task.retryPolicy.backoffMs * attempt 
  };
}
```

### Database Schema (for OpenOrca)

```sql
-- Task definitions
CREATE TABLE task_templates (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  input_schema JSONB NOT NULL,
  output_schema JSONB NOT NULL,
  validation_rules JSONB,
  default_agent_tier TEXT, -- 'fast', 'balanced', 'powerful'
  avg_duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Task executions
CREATE TABLE task_executions (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES task_templates(id),
  graph_id UUID, -- parent task graph
  status TEXT NOT NULL, -- pending, running, validating, complete, failed
  assigned_agent TEXT,
  input JSONB,
  output JSONB,
  validation_result JSONB,
  attempt_number INTEGER DEFAULT 1,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error TEXT
);

-- Task graphs (workflows)
CREATE TABLE task_graphs (
  id UUID PRIMARY KEY,
  name TEXT,
  goal TEXT NOT NULL,
  status TEXT NOT NULL, -- running, complete, failed
  tasks JSONB NOT NULL, -- array of task IDs with dependencies
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Validation history (for learning)
CREATE TABLE validation_history (
  id UUID PRIMARY KEY,
  execution_id UUID REFERENCES task_executions(id),
  validation_type TEXT, -- 'input', 'output', 'self-test'
  passed BOOLEAN,
  errors JSONB,
  feedback_given TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Part 3: Benefits & Tradeoffs

### Benefits

1. **Error Detection** — Catch failures at task boundaries, not at the end
2. **Debuggability** — Know exactly which task failed and why
3. **Cheaper Models** — Structure compensates for capability; use smaller models
4. **Reduced Hallucination** — Validation gates catch when output doesn't match schema
5. **Retry Intelligence** — Feedback loops help agents self-correct
6. **Audit Trail** — Full history of what was validated when

### Tradeoffs

1. **Latency** — Each validation step adds time
2. **Token Cost** — Validation prompts use tokens
3. **Complexity** — More moving parts to maintain
4. **Over-specification** — Too rigid schemas might reject valid creative outputs

### When to Use

| Scenario | Cascading Protocol? |
|----------|---------------------|
| Multi-step research task | ✅ Yes |
| Creative writing | ⚠️ Loose schemas only |
| Data transformation pipeline | ✅ Yes, strict schemas |
| Quick Q&A | ❌ Overkill |
| Code generation + testing | ✅ Yes |
| Exploratory analysis | ⚠️ Light validation |

---

## Part 4: Implementation Priority

### For Ren (Immediate)
1. Add task decomposition format to AGENTS.md
2. Practice using it on complex tasks
3. Log failures to learn validation patterns

### For OpenOrca (Roadmap)
1. **Phase 1:** Task contract schema + basic validation
2. **Phase 2:** Task graph execution engine
3. **Phase 3:** Backpressure handling + retry logic
4. **Phase 4:** UI for visualizing task graphs + validation status
5. **Phase 5:** ML-based validation (learn from validation history)

---

## Summary

The Cascading Protocol transforms agent task execution from "fire and hope" to "verify and proceed." By treating task boundaries as API contracts with validation, we get:

- Earlier error detection
- Self-correcting agents
- Cheaper model usage with maintained accuracy
- Full auditability

The cost is latency and complexity, but for multi-step tasks where correctness matters, it's worth it.

---

*Created: 2026-02-24*
*Author: Ren*
