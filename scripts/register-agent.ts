#!/usr/bin/env npx ts-node
/**
 * OpenOrca Agent Registration Script
 * 
 * Use this script to register an OpenClaw agent with the OpenOrca dashboard.
 * 
 * Usage:
 *   npx ts-node scripts/register-agent.ts
 *   
 * Or import and use programmatically:
 *   import { registerAgent, updateStatus, logAction } from './scripts/register-agent';
 */

import fetch from 'node-fetch';

const OPENORCA_URL = process.env.OPENORCA_URL || 'http://localhost:5000';

export interface AgentConfig {
  id: string;
  name: string;
  machineId: string;
  machineName: string;
  domain: 'communications' | 'productivity' | 'research' | 'development' | 'automation' | 'orchestration';
  integrations: string[];
  loadedCores?: string[];
  graphAccess?: 'read' | 'write' | 'admin';
  gatewayUrl?: string;
  gatewayToken?: string;
}

export interface StatusUpdate {
  status?: 'active' | 'idle' | 'waiting' | 'offline' | 'intervention_required';
  currentAction?: string;
  currentTaskId?: string | null;
  activityLevel?: number;
  memoryUsage?: number;
  interventionRequired?: boolean;
  interventionReason?: string;
}

export interface ActionLog {
  type: 'email_sent' | 'message_sent' | 'file_modified' | 'browser_action' | 'calendar_update' | 'command_run' | 'api_call' | 'decision' | 'orchestration';
  description: string;
  details?: string;
  integration: string;
  outcome?: 'success' | 'failure' | 'pending';
  requiresApproval?: boolean;
}

/**
 * Register an agent with OpenOrca
 */
export async function registerAgent(config: AgentConfig) {
  const response = await fetch(`${OPENORCA_URL}/api/agents/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Registration failed: ${JSON.stringify(error)}`);
  }
  
  return response.json();
}

/**
 * Update agent status
 */
export async function updateStatus(agentId: string, update: StatusUpdate) {
  const response = await fetch(`${OPENORCA_URL}/api/agents/${agentId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Status update failed: ${JSON.stringify(error)}`);
  }
  
  return response.json();
}

/**
 * Send heartbeat
 */
export async function heartbeat(agentId: string) {
  const response = await fetch(`${OPENORCA_URL}/api/agents/${agentId}/heartbeat`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Heartbeat failed: ${JSON.stringify(error)}`);
  }
  
  return response.json();
}

/**
 * Log an action
 */
export async function logAction(agentId: string, action: ActionLog) {
  const response = await fetch(`${OPENORCA_URL}/api/agents/${agentId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Action log failed: ${JSON.stringify(error)}`);
  }
  
  return response.json();
}

/**
 * Get all registered agents
 */
export async function getAgents() {
  const response = await fetch(`${OPENORCA_URL}/api/agents`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get agents: ${JSON.stringify(error)}`);
  }
  
  return response.json();
}

// CLI execution
if (require.main === module) {
  // Default: Register Ren as the orchestrator
  const renConfig: AgentConfig = {
    id: 'ren-orchestrator',
    name: 'Ren',
    machineId: 'beeline-mini',
    machineName: 'Beeline Mini PC',
    domain: 'orchestration',
    integrations: ['whatsapp', 'browser', 'terminal', 'files', 'calendar', 'voice', 'github'],
    loadedCores: ['orchestration-core', 'research-core', 'memory-core'],
    graphAccess: 'admin',
  };

  console.log('Registering Ren with OpenOrca...');
  
  registerAgent(renConfig)
    .then(result => {
      console.log('✅ Registration successful!');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('❌ Registration failed:', error.message);
      process.exit(1);
    });
}
