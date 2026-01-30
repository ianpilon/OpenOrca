// Claw Orchestrator: Command Center for OpenClaw Agents
// Manage your fleet of personal AI agents across machines

// Task domains for organizing agents
export type AgentDomain = 'communications' | 'productivity' | 'research' | 'development' | 'automation';
export type AgentStatus = 'active' | 'idle' | 'waiting' | 'offline' | 'intervention_required';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// OpenClaw integrations the agent can use
export type Integration = 
  | 'whatsapp' | 'telegram' | 'discord' | 'slack' | 'signal' | 'imessage' | 'email'
  | 'browser' | 'files' | 'terminal' | 'calendar' | 'notes' | 'github' | 'gmail';

// Machine/device where the agent runs
export interface Machine {
  id: string;
  name: string;
  os: 'macos' | 'windows' | 'linux' | 'android';
  location?: string;
  isOnline: boolean;
  lastSeen: string;
}

// OpenClaw Agent - a personal AI assistant running on a machine
export interface ClawAgent {
  id: string;
  name: string;
  machineId: string;
  machineName: string;
  status: AgentStatus;
  domain: AgentDomain;
  integrations: Integration[];
  currentTaskId: string | null;
  currentAction: string;
  memoryUsage: number; // 0-100
  uptime: string;
  tasksCompleted: number;
  collaboratingWith: string[]; // Other agent IDs
  interventionRequired: boolean;
  interventionReason?: string;
  activityLevel: number; // 0-100, for animation speed
}

// Task assigned to an agent
export interface AgentTask {
  id: string;
  agentId: string;
  agentName: string;
  domain: AgentDomain;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'waiting_approval';
  priority: TaskPriority;
  progress: number; // 0-100
  startTime: string;
  estimatedCompletion?: string;
  integrationsUsed: Integration[];
  collaborators: string[]; // Other agent IDs working on this
}

// Action log entry - what the agent has done
export interface ActionEntry {
  id: string;
  agentId: string;
  timestamp: string;
  type: 'email_sent' | 'message_sent' | 'file_modified' | 'browser_action' | 'calendar_update' | 'command_run' | 'api_call' | 'decision';
  description: string;
  details?: string;
  integration: Integration;
  outcome: 'success' | 'failure' | 'pending';
  requiresApproval: boolean;
}

// Swarm - multiple agents collaborating on a complex task
export interface Swarm {
  id: string;
  name: string;
  objective: string;
  agents: string[];
  leadAgentId: string;
  status: 'forming' | 'active' | 'completed' | 'disbanded';
  progress: number;
  tasksTotal: number;
  tasksCompleted: number;
}

// Intervention request from an agent
export interface Intervention {
  id: string;
  agentId: string;
  agentName: string;
  type: 'approval_needed' | 'clarification' | 'permission' | 'error' | 'cost_limit';
  question: string;
  context: string;
  options?: string[];
  timestamp: string;
  priority: TaskPriority;
}

// System-wide health
export interface FleetHealth {
  totalAgents: number;
  activeAgents: number;
  offlineAgents: number;
  interventionsRequired: number;
  tasksInProgress: number;
  tasksCompletedToday: number;
  swarmsActive: number;
  overallHealth: 'healthy' | 'degraded' | 'critical';
}

// Color system for Claw Orchestrator
export const domainColors: Record<AgentDomain, string> = {
  communications: '#ec4899', // Pink - messaging/email
  productivity: '#3b82f6', // Blue - calendar/docs
  research: '#8b5cf6', // Purple - browser/analysis
  development: '#22c55e', // Green - code/terminal
  automation: '#f59e0b', // Amber - scheduled tasks
};

export const statusColors: Record<AgentStatus, string> = {
  active: '#22c55e',
  idle: '#6b7280',
  waiting: '#3b82f6',
  offline: '#374151',
  intervention_required: '#f59e0b',
};

export const integrationIcons: Record<Integration, string> = {
  whatsapp: '💬',
  telegram: '✈️',
  discord: '🎮',
  slack: '💼',
  signal: '🔒',
  imessage: '💭',
  email: '📧',
  browser: '🌐',
  files: '📁',
  terminal: '⌨️',
  calendar: '📅',
  notes: '📝',
  github: '🐙',
  gmail: '✉️',
};

// Agent names
const agentNames = [
  'Claw-Alpha', 'Claw-Beta', 'Claw-Gamma', 'Claw-Delta', 'Claw-Epsilon',
  'Claw-Zeta', 'Claw-Eta', 'Claw-Theta', 'Claw-Iota', 'Claw-Kappa',
  'Pincer', 'Gripper', 'Snapper', 'Clutch', 'Grabber',
];

const machineNames = [
  'MacBook Pro', 'iMac Studio', 'Mac Mini', 'ThinkPad X1', 'Surface Pro',
  'Dell XPS', 'Linux Server', 'Home Desktop', 'Work Laptop', 'Dev Machine',
];

const currentActions: Record<AgentDomain, string[]> = {
  communications: [
    'Monitoring WhatsApp for messages...',
    'Drafting email response...',
    'Checking Slack notifications...',
    'Sending scheduled message...',
    'Organizing inbox...',
  ],
  productivity: [
    'Scheduling meeting...',
    'Updating calendar events...',
    'Creating document summary...',
    'Managing task list...',
    'Syncing notes...',
  ],
  research: [
    'Searching web for information...',
    'Analyzing competitor data...',
    'Compiling research report...',
    'Browsing documentation...',
    'Collecting market data...',
  ],
  development: [
    'Running code analysis...',
    'Executing terminal command...',
    'Committing changes to GitHub...',
    'Reviewing pull request...',
    'Debugging issue...',
  ],
  automation: [
    'Running scheduled workflow...',
    'Processing batch job...',
    'Executing automation script...',
    'Monitoring system health...',
    'Backing up data...',
  ],
};

const taskTitles: Record<AgentDomain, string[]> = {
  communications: [
    'Process and respond to emails',
    'Monitor WhatsApp group for mentions',
    'Send weekly team update',
    'Archive old Slack messages',
    'Draft newsletter content',
  ],
  productivity: [
    'Organize calendar for next week',
    'Create meeting notes summary',
    'Update project documentation',
    'Schedule recurring reminders',
    'Sync tasks across platforms',
  ],
  research: [
    'Research market trends',
    'Compile competitor analysis',
    'Find relevant articles',
    'Analyze user feedback',
    'Build knowledge base',
  ],
  development: [
    'Review and merge PRs',
    'Run automated tests',
    'Deploy staging environment',
    'Monitor error logs',
    'Update dependencies',
  ],
  automation: [
    'Daily backup routine',
    'System health monitoring',
    'Data synchronization job',
    'Report generation workflow',
    'Cleanup old files',
  ],
};

const interventionQuestions = [
  'Should I send this email to 50+ recipients?',
  'This action will cost $12.50 - proceed?',
  'I need access to your Google Drive. Grant permission?',
  'The file contains sensitive data. Confirm deletion?',
  'Should I schedule this meeting for tomorrow at 9 AM?',
  'This message seems unusual. Send anyway?',
  'API rate limit approaching. Pause or continue?',
];

// Helper functions
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function generateMachine(): Machine {
  const os = randomItem(['macos', 'windows', 'linux', 'android'] as const);
  return {
    id: `machine-${generateId()}`,
    name: randomItem(machineNames),
    os,
    location: randomItem(['Home Office', 'Work', 'Mobile', 'Server Room', undefined]),
    isOnline: Math.random() > 0.1,
    lastSeen: Math.random() > 0.5 ? 'now' : `${randomInt(1, 60)}m ago`,
  };
}

function generateAgent(machine: Machine, domain: AgentDomain): ClawAgent {
  const status: AgentStatus = machine.isOnline 
    ? randomItem(['active', 'active', 'active', 'idle', 'waiting', 'intervention_required'])
    : 'offline';
  const interventionRequired = status === 'intervention_required';
  
  const domainIntegrations: Record<AgentDomain, Integration[]> = {
    communications: ['whatsapp', 'telegram', 'discord', 'slack', 'email', 'gmail'],
    productivity: ['calendar', 'notes', 'files', 'gmail'],
    research: ['browser', 'files', 'notes'],
    development: ['terminal', 'github', 'files', 'browser'],
    automation: ['terminal', 'files', 'calendar', 'email'],
  };
  
  const availableIntegrations = domainIntegrations[domain];
  const activeIntegrations = availableIntegrations.slice(0, randomInt(2, availableIntegrations.length));
  
  return {
    id: `agent-${generateId()}`,
    name: randomItem(agentNames),
    machineId: machine.id,
    machineName: machine.name,
    status,
    domain,
    integrations: activeIntegrations,
    currentTaskId: null,
    currentAction: status === 'active' ? randomItem(currentActions[domain]) : 'Idle',
    memoryUsage: randomInt(20, 85),
    uptime: `${randomInt(1, 168)}h`,
    tasksCompleted: randomInt(10, 500),
    collaboratingWith: [],
    interventionRequired,
    interventionReason: interventionRequired ? randomItem(interventionQuestions) : undefined,
    activityLevel: status === 'active' ? randomInt(40, 100) : status === 'idle' ? randomInt(5, 20) : 0,
  };
}

function generateTask(agent: ClawAgent): AgentTask {
  const status = randomItem(['pending', 'in_progress', 'in_progress', 'in_progress', 'completed', 'waiting_approval'] as const);
  
  return {
    id: `task-${generateId()}`,
    agentId: agent.id,
    agentName: agent.name,
    domain: agent.domain,
    title: randomItem(taskTitles[agent.domain]),
    description: `Automated task for ${agent.domain} domain`,
    status,
    priority: randomItem(['low', 'medium', 'medium', 'high', 'urgent']),
    progress: status === 'completed' ? 100 : status === 'pending' ? 0 : randomInt(10, 90),
    startTime: `${randomInt(1, 24)}h ago`,
    estimatedCompletion: status !== 'completed' ? `${randomInt(5, 60)}m` : undefined,
    integrationsUsed: agent.integrations.slice(0, randomInt(1, 3)),
    collaborators: [],
  };
}

function generateActionEntry(agent: ClawAgent): ActionEntry {
  const actionTypes: Record<AgentDomain, ActionEntry['type'][]> = {
    communications: ['email_sent', 'message_sent', 'message_sent'],
    productivity: ['calendar_update', 'file_modified', 'decision'],
    research: ['browser_action', 'file_modified', 'api_call'],
    development: ['command_run', 'file_modified', 'api_call'],
    automation: ['command_run', 'api_call', 'file_modified'],
  };
  
  const type = randomItem(actionTypes[agent.domain]);
  const descriptions: Record<ActionEntry['type'], string[]> = {
    email_sent: ['Sent response to project update', 'Forwarded document to team', 'Replied to meeting invitation'],
    message_sent: ['Sent WhatsApp message to team group', 'Posted update in Slack channel', 'Replied in Discord thread'],
    file_modified: ['Updated project-notes.md', 'Created new spreadsheet', 'Edited configuration file'],
    browser_action: ['Searched for API documentation', 'Downloaded research paper', 'Filled out web form'],
    calendar_update: ['Scheduled team standup', 'Moved meeting to next week', 'Added reminder for deadline'],
    command_run: ['Executed npm install', 'Ran database backup', 'Started dev server'],
    api_call: ['Fetched weather data', 'Updated CRM record', 'Synced with external service'],
    decision: ['Chose optimal meeting time', 'Selected best response template', 'Prioritized task queue'],
  };
  
  return {
    id: `action-${generateId()}`,
    agentId: agent.id,
    timestamp: `${randomInt(1, 60)}m ago`,
    type,
    description: randomItem(descriptions[type]),
    integration: randomItem(agent.integrations),
    outcome: randomItem(['success', 'success', 'success', 'pending', 'failure']),
    requiresApproval: Math.random() > 0.85,
  };
}

function generateIntervention(agent: ClawAgent): Intervention {
  return {
    id: `intervention-${generateId()}`,
    agentId: agent.id,
    agentName: agent.name,
    type: randomItem(['approval_needed', 'clarification', 'permission', 'cost_limit']),
    question: agent.interventionReason || randomItem(interventionQuestions),
    context: `Task: ${randomItem(taskTitles[agent.domain])}`,
    options: Math.random() > 0.5 ? ['Approve', 'Deny', 'Ask me later'] : undefined,
    timestamp: `${randomInt(1, 30)}m ago`,
    priority: randomItem(['medium', 'high', 'urgent']),
  };
}

function generateSwarm(agents: ClawAgent[]): Swarm {
  const swarmAgents = agents.filter(a => a.status === 'active').slice(0, randomInt(2, 4));
  if (swarmAgents.length < 2) return null as any;
  
  swarmAgents.forEach((a, i) => {
    a.collaboratingWith = swarmAgents.filter((_, j) => j !== i).map(sa => sa.id);
  });
  
  const tasksTotal = randomInt(3, 8);
  const tasksCompleted = randomInt(0, tasksTotal);
  
  return {
    id: `swarm-${generateId()}`,
    name: randomItem([
      'Research Sprint', 'Email Blitz', 'Data Migration', 'Content Generation',
      'Market Analysis', 'Customer Outreach', 'System Audit',
    ]),
    objective: randomItem([
      'Complete comprehensive market research report',
      'Process and respond to all pending emails',
      'Migrate data to new system',
      'Generate weekly content for all channels',
    ]),
    agents: swarmAgents.map(a => a.id),
    leadAgentId: swarmAgents[0].id,
    status: randomItem(['forming', 'active', 'active', 'active', 'completed']),
    progress: Math.round((tasksCompleted / tasksTotal) * 100),
    tasksTotal,
    tasksCompleted,
  };
}

// Main data structure
export interface ClawOrchestratorData {
  machines: Machine[];
  agents: ClawAgent[];
  tasks: AgentTask[];
  actionLog: ActionEntry[];
  interventions: Intervention[];
  swarms: Swarm[];
  fleetHealth: FleetHealth;
}

export function generateClawData(): ClawOrchestratorData {
  // Generate machines
  const machines = Array.from({ length: randomInt(3, 5) }, generateMachine);
  
  // Generate agents across different domains
  const domains: AgentDomain[] = ['communications', 'productivity', 'research', 'development', 'automation'];
  const agents: ClawAgent[] = [];
  
  machines.forEach(machine => {
    // Each machine runs 1-3 agents
    const numAgents = randomInt(1, 3);
    for (let i = 0; i < numAgents; i++) {
      const domain = domains[i % domains.length];
      const agent = generateAgent(machine, domain);
      agents.push(agent);
    }
  });
  
  // Generate tasks for active agents
  const tasks: AgentTask[] = [];
  agents.forEach(agent => {
    if (agent.status === 'active' || agent.status === 'waiting') {
      const task = generateTask(agent);
      tasks.push(task);
      agent.currentTaskId = task.id;
    }
  });
  
  // Generate action log
  const actionLog: ActionEntry[] = [];
  agents.forEach(agent => {
    const numActions = randomInt(2, 6);
    for (let i = 0; i < numActions; i++) {
      actionLog.push(generateActionEntry(agent));
    }
  });
  actionLog.sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));
  
  // Generate interventions
  const interventions = agents
    .filter(a => a.interventionRequired)
    .map(a => generateIntervention(a));
  
  // Generate swarms
  const swarms = Array.from({ length: randomInt(1, 3) }, () => generateSwarm(agents))
    .filter(s => s !== null);
  
  // Calculate fleet health
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const offlineAgents = agents.filter(a => a.status === 'offline').length;
  const interventionsRequired = interventions.length;
  
  const fleetHealth: FleetHealth = {
    totalAgents: agents.length,
    activeAgents,
    offlineAgents,
    interventionsRequired,
    tasksInProgress: tasks.filter(t => t.status === 'in_progress').length,
    tasksCompletedToday: randomInt(20, 100),
    swarmsActive: swarms.filter(s => s.status === 'active').length,
    overallHealth: interventionsRequired > 3 ? 'critical' : interventionsRequired > 1 ? 'degraded' : 'healthy',
  };
  
  return {
    machines,
    agents,
    tasks,
    actionLog,
    interventions,
    swarms,
    fleetHealth,
  };
}
