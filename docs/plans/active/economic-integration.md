# Plan: Economic Integration

> Making OpenOrca agents economically self-sustaining

**Status:** Planning
**Started:** 2026-02-16
**Owner:** Ren + Ian

---

## Objective

Transform OpenOrca agents from cost centers to profit centers by integrating ClawWork-style economic accountability.

---

## Success Criteria

1. Agents know their costs (token usage, API calls)
2. Agents can earn income from tasks
3. Survival status visible in UI
4. Fleet profitability measurable

---

## Phases

### Phase 1: Cost Tracking ✅ [In Progress]

**Tasks:**
- [ ] Add economic fields to ClawAgent type
- [ ] Create EconomicTracker service
- [ ] Track token costs per agent action
- [ ] Add survival tier calculation
- [ ] Display costs in UI

**Files to modify:**
- `client/src/lib/clawData.ts` — Type definitions
- `server/economic/` — New service directory
- `client/src/components/` — UI updates

### Phase 2: Revenue Tracking

**Tasks:**
- [ ] Define task value estimation
- [ ] Create quality evaluation pipeline
- [ ] Calculate payments per task
- [ ] Track income per agent
- [ ] Revenue display in UI

**Dependencies:**
- GDPVal dataset or equivalent
- LLM evaluator (GPT-based)

### Phase 3: Task Marketplace

**Tasks:**
- [ ] Load GDPVal tasks
- [ ] Task assignment logic
- [ ] Task status tracking
- [ ] Agent task selection
- [ ] Marketplace UI

### Phase 4: Self-Sustaining Mode

**Tasks:**
- [ ] Token costs deducted from balance
- [ ] Automatic task acquisition
- [ ] Profit reinvestment rules
- [ ] Death/revival mechanics
- [ ] Fleet economics dashboard

---

## Technical Design

### Economic Tracker

```typescript
interface EconomicTracker {
  agentId: string;
  balance: number;
  
  // Cost tracking
  trackTokens(input: number, output: number): void;
  trackApiCall(type: string, cost: number): void;
  
  // Income tracking
  recordIncome(taskId: string, amount: number): void;
  
  // Status
  getSurvivalTier(): SurvivalTier;
  getDailyStats(): DailyStats;
}

type SurvivalTier = 'thriving' | 'stable' | 'struggling' | 'critical' | 'dead';
```

### Token Pricing

| Token Type | Cost per 1M |
|------------|-------------|
| Input | $2.50 |
| Output | $10.00 |

(Adjustable based on model used)

### Survival Tiers

| Tier | Balance Range |
|------|---------------|
| Thriving | > $100 |
| Stable | $10 - $100 |
| Struggling | $1 - $10 |
| Critical | < $1 |
| Dead | ≤ $0 |

---

## Questions to Resolve

1. **Initial balance:** $10 per agent? Configurable?
2. **Task source:** GDPVal only or expand?
3. **Swarm economics:** How do swarms split payment?
4. **Human intervention cost:** Free or charged?
5. **Knowledge value:** Does learning count as work?

---

## Risks

| Risk | Mitigation |
|------|------------|
| Task scarcity | Multiple task sources |
| Quality eval bias | Multiple evaluators |
| Token cost volatility | Configurable pricing |
| Agent death cascade | Revival mechanics |

---

## Timeline

| Phase | Duration | Target |
|-------|----------|--------|
| Phase 1 | 1 week | Cost tracking live |
| Phase 2 | 1 week | Revenue tracking |
| Phase 3 | 2 weeks | Task marketplace |
| Phase 4 | 2 weeks | Self-sustaining |

Total: ~6 weeks to full economic integration

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-16 | Use ClawWork model | Proven approach, good docs |
| 2026-02-16 | Start with cost tracking | Foundation for everything else |

---

*Update this plan as work progresses.*
