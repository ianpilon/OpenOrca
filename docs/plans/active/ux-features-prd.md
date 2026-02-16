# OpenOrca UX Features PRD

**Status:** Draft
**Created:** 2026-02-16
**Owner:** Ian Pilon
**Contributor:** Ren (AI)

---

## Executive Summary

This PRD consolidates UX patterns identified from research into ClawTime, Rowboat, Harness Engineering, ClawWork, and tldraw-sandbox. Features are organized into phases with clear priorities.

**Goal:** Make OpenOrca the most intuitive, transparent, and powerful agent fleet management interface.

---

## Current State

✅ **Already shipped:**
- Network visualization (force-graph with agent nodes)
- Agent inspector panel (stats, integrations, tasks, actions)
- Embedded per-agent terminal (just shipped today)
- Quick action buttons in terminal

---

## Feature Inventory

### Category 1: Agent Identity & Presence

| Feature | Source | Description | Priority |
|---------|--------|-------------|----------|
| Agent avatars | ClawTime | Visual identity per agent (icon, color, style) | P1 |
| State visualization | ClawTime | Node appearance changes based on state (thinking, active, idle, error) | P1 |
| Agent personality | ClawTime | Distinct "voice" per agent in terminal responses | P2 |
| 3D animated avatars | ClawTime | Full 3D voxel characters for premium feel | P3 |

### Category 2: Memory & Transparency

| Feature | Source | Description | Priority |
|---------|--------|-------------|----------|
| Memory file viewer | Rowboat | Inspect agent's MEMORY.md and daily logs | P1 |
| Memory editor | Rowboat | Edit agent memory directly in UI | P2 |
| Cross-agent backlinks | Rowboat | See knowledge connections between agents | P2 |
| Memory timeline | Rowboat | Visual history of what agent learned when | P3 |

### Category 3: Voice & Interaction

| Feature | Source | Description | Priority |
|---------|--------|-------------|----------|
| Voice input | ClawTime | Tap-to-talk to agents | P2 |
| Voice output | ClawTime | Agents speak responses (TTS) | P2 |
| Barge-in support | ClawTime | Interrupt agent mid-speech | P3 |
| Widget responses | ClawTime | Agents can return buttons, forms, progress bars | P2 |

### Category 4: Economics & Accountability

| Feature | Source | Description | Priority |
|---------|--------|-------------|----------|
| Token usage per agent | ClawWork | Track API costs per agent | P1 |
| Cost/task metrics | ClawWork | Show cost efficiency | P2 |
| Revenue tracking | ClawWork | If agent earns money, show it | P3 |
| Survival dashboard | ClawWork | Agents that underperform get flagged | P3 |

### Category 5: Environment & Onboarding

| Feature | Source | Description | Priority |
|---------|--------|-------------|----------|
| Agent bootstrap wizard | Harness | Guided setup for new agents | P2 |
| AGENTS.md viewer | Harness | See agent's instructions/soul | P1 |
| Principles display | Harness | Show decision heuristics | P2 |
| Regression log | Harness | Track agent failures and learnings | P2 |

### Category 6: Pipeline & Workflow (from tldraw-sandbox)

| Feature | Source | Description | Priority |
|---------|--------|-------------|----------|
| Visual workflow editor | tldraw | Drag-and-drop agent pipelines | P3 |
| Arrow-based connections | tldraw | Draw data flow between agents | P3 |
| Pipeline execution | tldraw | Run connected agents in order | P3 |

---

## Phased Rollout

### Phase 1: Transparency & Trust (2-3 weeks)
*Users can see what agents know and what they cost*

| Feature | Effort | Notes |
|---------|--------|-------|
| Memory file viewer | M | Read-only view of MEMORY.md in inspector |
| AGENTS.md viewer | S | Tab in inspector showing agent's soul |
| Token usage per agent | M | Track and display in stats panel |
| Agent state visualization | S | Node glow/color changes based on status |

**Success criteria:**
- Users can inspect any agent's memory without leaving UI
- Token costs visible per agent per session
- Agent states are immediately obvious visually

### Phase 2: Identity & Interaction (3-4 weeks)
*Agents feel like individuals, not generic bots*

| Feature | Effort | Notes |
|---------|--------|-------|
| Agent avatars | M | Upload or select avatar per agent |
| Memory editor | M | Edit memory files in-app |
| Widget responses | L | Agents can push buttons/forms to terminal |
| Agent bootstrap wizard | M | Guided new-agent creation |

**Success criteria:**
- Each agent has distinct visual identity
- Users can correct agent memory without SSH/file access
- Agents can offer interactive choices, not just text

### Phase 3: Voice & Premium (4-6 weeks)
*Full voice interaction, 3D presence*

| Feature | Effort | Notes |
|---------|--------|-------|
| Voice input (STT) | M | Browser-based speech recognition |
| Voice output (TTS) | M | Edge-TTS integration |
| 3D animated avatars | L | Three.js voxel characters |
| Cost/task metrics | M | Efficiency dashboard |

**Success criteria:**
- Users can talk to agents hands-free
- Agents respond with voice
- Visual delight from animated avatars

### Phase 4: Workflows & Economics (6+ weeks)
*Advanced orchestration, self-sustaining agents*

| Feature | Effort | Notes |
|---------|--------|-------|
| Visual workflow editor | XL | tldraw-style pipeline builder |
| Revenue tracking | L | Integrate with payment/task systems |
| Survival dashboard | M | Flag underperforming agents |
| Cross-agent backlinks | L | Knowledge graph visualization |

**Success criteria:**
- Users can build multi-agent workflows visually
- Agents that earn money show positive ROI
- Knowledge sharing between agents is visible

---

## Effort Key

| Size | Time Estimate | Description |
|------|---------------|-------------|
| S | < 1 day | Small change, isolated component |
| M | 1-3 days | New component or significant refactor |
| L | 3-7 days | New system or major feature |
| XL | 1-2 weeks | Complex feature with multiple parts |

---

## Dependencies

| Feature | Depends On |
|---------|------------|
| Memory editor | Memory file viewer |
| Voice output | Voice input (ideally) |
| Widget responses | Terminal infrastructure (done) |
| Revenue tracking | ClawWork integration (external) |
| 3D avatars | Basic avatars first |

---

## Open Questions

1. **Avatar system:** Custom uploads vs pre-made library vs AI-generated?
2. **Voice provider:** Edge-TTS (free) vs ElevenLabs (paid, better)?
3. **Memory format:** Stick with Markdown or add structured JSON?
4. **Widget protocol:** How do agents declare available actions?

---

## Next Steps

1. [ ] Review and prioritize with Ian
2. [ ] Pick Phase 1 features to start
3. [ ] Create individual tickets/issues
4. [ ] Set up milestone in GitHub

---

*This is a living document. Update as priorities shift.*
