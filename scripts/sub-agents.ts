/**
 * Sub-Agent Configurations for OpenOrca
 * 
 * These are the default agent configurations that can be registered
 * with the OpenOrca orchestration system.
 * 
 * Usage:
 *   npx tsx scripts/sub-agents.ts register-all
 *   npx tsx scripts/sub-agents.ts register <agent-id>
 */

import type { RegisterAgentInput } from '../shared/schema';

// Base URL for OpenOrca API
const API_BASE = process.env.OPENORCA_API_URL || 'http://localhost:5000';

// ============================================
// Sub-Agent Definitions
// ============================================

export const SUB_AGENTS: Record<string, RegisterAgentInput> = {
  // Ren - The Orchestrator (main coordinator)
  'ren-orchestrator': {
    id: 'ren-orchestrator',
    name: 'Ren',
    machineId: 'beeline-mini',
    machineName: 'Beeline Mini PC',
    domain: 'orchestration',
    integrations: ['whatsapp', 'browser', 'terminal', 'files', 'calendar', 'voice', 'github'],
    loadedCores: ['orchestration-core', 'research-core', 'memory-core'],
    graphAccess: 'admin',
  },

  // Research Agent - Web research, data analysis
  'research-agent': {
    id: 'research-agent',
    name: 'Scout',
    machineId: 'beeline-mini',
    machineName: 'Beeline Mini PC',
    domain: 'research',
    integrations: ['browser', 'files'],
    loadedCores: ['research-core', 'web-core'],
    graphAccess: 'write',
  },

  // Development Agent - Code, git, terminal operations
  'dev-agent': {
    id: 'dev-agent',
    name: 'Builder',
    machineId: 'beeline-mini',
    machineName: 'Beeline Mini PC',
    domain: 'development',
    integrations: ['terminal', 'github', 'files'],
    loadedCores: ['development-core', 'git-core'],
    graphAccess: 'write',
  },

  // Communications Agent - Messaging, email, notifications
  'comms-agent': {
    id: 'comms-agent',
    name: 'Herald',
    machineId: 'beeline-mini',
    machineName: 'Beeline Mini PC',
    domain: 'communications',
    integrations: ['whatsapp', 'telegram', 'email'],
    loadedCores: ['messaging-core'],
    graphAccess: 'read',
  },

  // Automation Agent - Cron, workflows, file operations
  'automation-agent': {
    id: 'automation-agent',
    name: 'Clockwork',
    machineId: 'beeline-mini',
    machineName: 'Beeline Mini PC',
    domain: 'automation',
    integrations: ['files', 'calendar'],
    loadedCores: ['automation-core', 'workflow-core'],
    graphAccess: 'write',
  },
};

// ============================================
// Registration Functions
// ============================================

async function registerAgent(config: RegisterAgentInput): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/agents/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error(`❌ Failed to register ${config.name}: ${err.error}`);
      return false;
    }

    const data = await response.json();
    console.log(`✅ Registered: ${data.agent.name} (${data.agent.id}) - ${data.agent.domain}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Error registering ${config.name}: ${error.message}`);
    return false;
  }
}

async function registerAll(): Promise<void> {
  console.log('🐋 Registering OpenOrca Sub-Agents...\n');
  
  let success = 0;
  let failed = 0;
  
  for (const [id, config] of Object.entries(SUB_AGENTS)) {
    const ok = await registerAgent(config);
    if (ok) success++;
    else failed++;
  }
  
  console.log(`\n📊 Results: ${success} registered, ${failed} failed`);
}

async function listAgents(): Promise<void> {
  console.log('📋 Available Sub-Agents:\n');
  
  for (const [id, config] of Object.entries(SUB_AGENTS)) {
    console.log(`  ${config.name} (${id})`);
    console.log(`    Domain: ${config.domain}`);
    console.log(`    Integrations: ${config.integrations.join(', ')}`);
    console.log('');
  }
}

// ============================================
// CLI Handler
// ============================================

const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'register-all':
    registerAll();
    break;
    
  case 'register':
    if (!arg || !SUB_AGENTS[arg]) {
      console.error(`Unknown agent: ${arg}`);
      console.log('Available agents:', Object.keys(SUB_AGENTS).join(', '));
      process.exit(1);
    }
    registerAgent(SUB_AGENTS[arg]);
    break;
    
  case 'list':
    listAgents();
    break;
    
  default:
    console.log(`
OpenOrca Sub-Agent Manager

Usage:
  npx tsx scripts/sub-agents.ts <command> [agent-id]

Commands:
  register-all    Register all sub-agents
  register <id>   Register a specific agent
  list            List available agent configs

Examples:
  npx tsx scripts/sub-agents.ts register-all
  npx tsx scripts/sub-agents.ts register ren-orchestrator
  npx tsx scripts/sub-agents.ts list
`);
}
