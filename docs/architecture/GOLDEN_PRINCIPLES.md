# Golden Principles

> Opinionated rules that keep the codebase coherent for agents and humans.

These principles are enforced continuously. When violated, agents fix them.

---

## 1. Repository is Truth

**Principle:** If it's not in the repo, it doesn't exist to the agent.

**Why:** Agents can only see versioned artifacts. Slack discussions, meeting notes, and tribal knowledge are invisible.

**In practice:**
- Document decisions in markdown
- Commit design docs before implementing
- Link to source in code comments
- Update docs when code changes

---

## 2. Boundaries are Sacred

**Principle:** Layer violations break everything. Dependencies flow forward only.

**Why:** Agents need predictable structure. Circular dependencies create confusion.

**Layer model:**
```
Types → Config → Repository → Service → Runtime → UI
```

**Enforcement:**
- Custom linter checks import directions
- Error message includes which direction is allowed
- CI blocks violations

---

## 3. Validate at Boundaries

**Principle:** Parse data at service boundaries. Don't probe YOLO-style.

**Why:** Type safety catches errors early. Guessing shapes leads to runtime failures.

**In practice:**
- Use Zod or similar at API boundaries
- Validate external data on receipt
- Type all function signatures
- No `any` types without justification

---

## 4. Shared > Hand-Rolled

**Principle:** Prefer shared utilities over duplicated helpers.

**Why:** Centralizes invariants. One fix applies everywhere.

**In practice:**
- Check for existing utility before writing new one
- If pattern appears 3+ times, extract to shared
- Document utility purpose and usage
- Test utilities thoroughly

---

## 5. Structured Logging

**Principle:** All logging is structured. No raw console.log.

**Why:** Structured logs are queryable by agents and observability tools.

**Format:**
```typescript
log.info('Task completed', {
  taskId: '123',
  agentId: 'agent-456',
  durationMs: 1200,
  status: 'success'
});
```

**Not:**
```typescript
console.log('Task 123 done in 1.2s'); // ❌
```

---

## 6. Legibility > Cleverness

**Principle:** Optimize for agent comprehension, not human cleverness.

**Why:** Agents will maintain this code. They need to understand it.

**In practice:**
- Explicit over implicit
- Verbose names over abbreviations
- Comments explain "why", not "what"
- Avoid obscure language features

---

## 7. Small Files

**Principle:** Components under 300 lines. Split if larger.

**Why:** Large files exceed context windows. Smaller files are easier to reason about.

**When to split:**
- Multiple responsibilities
- Multiple exported functions
- Hard to summarize purpose
- Frequent merge conflicts

---

## 8. Fail Fast

**Principle:** Errors surface immediately, not silently.

**Why:** Silent failures cascade. Early errors are cheaper.

**In practice:**
- Throw on invalid input
- Log errors with full context
- Don't catch and ignore
- Propagate errors to callers

---

## 9. Tests Document Behavior

**Principle:** Tests serve as documentation of expected behavior.

**Why:** Agents read tests to understand intent.

**In practice:**
- Descriptive test names
- Test edge cases
- Test error conditions
- Keep tests alongside code

---

## 10. Economic Awareness

**Principle:** Consider the cost of every action.

**Why:** Agents may operate under economic constraints. Wasteful operations cost money.

**In practice:**
- Minimize unnecessary API calls
- Cache when appropriate
- Batch operations when possible
- Log costs for visibility

---

## Enforcement

These principles are enforced via:

1. **Custom linters** — Check at commit time
2. **CI gates** — Block violations
3. **Recurring cleanup** — Agents scan for drift
4. **Code review** — Human taste layer

When principles conflict, use judgment. Document the tradeoff.

---

## Adding Principles

New principles require:
1. Clear statement
2. Rationale ("why")
3. Practical guidance ("in practice")
4. Enforcement mechanism

Don't add principles lightly. Each one creates overhead.

---

*These principles are the immune system. They keep the codebase healthy.*
