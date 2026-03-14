import { 
  type User, type InsertUser, type AgentRecord, type RegisterAgentInput, 
  type UpdateAgentStatusInput, type ActionEntry, type Task, type Subtask,
  type CreateTaskInput, type TaskType, type TaskStatus, DEFAULT_ROUTING_RULES,
  type TaskPriority
} from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface with CRUD methods for users and agents
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Agent methods
  registerAgent(input: RegisterAgentInput): Promise<AgentRecord>;
  getAgent(id: string): Promise<AgentRecord | undefined>;
  getAllAgents(): Promise<AgentRecord[]>;
  updateAgentStatus(id: string, update: UpdateAgentStatusInput): Promise<AgentRecord | undefined>;
  removeAgent(id: string): Promise<boolean>;
  heartbeat(id: string): Promise<AgentRecord | undefined>;
  
  // Action log methods
  logAction(entry: Omit<ActionEntry, 'id' | 'timestamp'>): Promise<ActionEntry>;
  getAgentActions(agentId: string, limit?: number): Promise<ActionEntry[]>;
  getAllActions(limit?: number): Promise<ActionEntry[]>;
  
  // Task methods
  createTask(input: CreateTaskInput): Promise<Task>;
  getTask(id: string): Promise<Task | undefined>;
  getAllTasks(limit?: number): Promise<Task[]>;
  updateTaskStatus(id: string, status: TaskStatus, result?: string): Promise<Task | undefined>;
  updateSubtask(taskId: string, subtaskId: string, update: Partial<Subtask>): Promise<Task | undefined>;
  assignSubtaskToAgent(taskId: string, subtaskId: string, agentId: string): Promise<Task | undefined>;
  
  // Routing
  findAgentForTaskType(taskType: TaskType): Promise<AgentRecord | undefined>;
  addSubtasksToTask(taskId: string, subtasks: Omit<Subtask, 'id' | 'parentTaskId' | 'createdAt'>[]): Promise<Task | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private agents: Map<string, AgentRecord>;
  private actions: ActionEntry[];
  private tasks: Map<string, Task>;

  constructor() {
    this.users = new Map();
    this.agents = new Map();
    this.actions = [];
    this.tasks = new Map();
  }

  // ============ User Methods ============
  
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // ============ Agent Methods ============
  
  async registerAgent(input: RegisterAgentInput): Promise<AgentRecord> {
    const now = new Date().toISOString();
    
    // Check if agent already exists - update instead of duplicate
    const existing = this.agents.get(input.id);
    if (existing) {
      const updated: AgentRecord = {
        ...existing,
        ...input,
        lastHeartbeat: now,
        status: 'active',
      };
      this.agents.set(input.id, updated);
      return updated;
    }
    
    const agent: AgentRecord = {
      ...input,
      status: 'active',
      currentTaskId: null,
      currentAction: 'Initializing...',
      memoryUsage: 0,
      uptime: '0h',
      tasksCompleted: 0,
      collaboratingWith: [],
      interventionRequired: false,
      activityLevel: 50,
      knowledgeContributions: 0,
      registeredAt: now,
      lastHeartbeat: now,
    };
    
    this.agents.set(input.id, agent);
    return agent;
  }

  async getAgent(id: string): Promise<AgentRecord | undefined> {
    return this.agents.get(id);
  }

  async getAllAgents(): Promise<AgentRecord[]> {
    return Array.from(this.agents.values());
  }

  async updateAgentStatus(id: string, update: UpdateAgentStatusInput): Promise<AgentRecord | undefined> {
    const agent = this.agents.get(id);
    if (!agent) return undefined;
    
    const updated: AgentRecord = {
      ...agent,
      ...update,
      lastHeartbeat: new Date().toISOString(),
    };
    
    this.agents.set(id, updated);
    return updated;
  }

  async removeAgent(id: string): Promise<boolean> {
    return this.agents.delete(id);
  }

  async heartbeat(id: string): Promise<AgentRecord | undefined> {
    const agent = this.agents.get(id);
    if (!agent) return undefined;
    
    const updated: AgentRecord = {
      ...agent,
      lastHeartbeat: new Date().toISOString(),
    };
    
    this.agents.set(id, updated);
    return updated;
  }

  // ============ Action Log Methods ============
  
  async logAction(entry: Omit<ActionEntry, 'id' | 'timestamp'>): Promise<ActionEntry> {
    const action: ActionEntry = {
      ...entry,
      id: `action-${randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
    };
    
    this.actions.unshift(action); // Most recent first
    
    // Keep last 1000 actions in memory
    if (this.actions.length > 1000) {
      this.actions = this.actions.slice(0, 1000);
    }
    
    return action;
  }

  async getAgentActions(agentId: string, limit = 50): Promise<ActionEntry[]> {
    return this.actions
      .filter(a => a.agentId === agentId)
      .slice(0, limit);
  }

  async getAllActions(limit = 100): Promise<ActionEntry[]> {
    return this.actions.slice(0, limit);
  }

  // ============ Task Methods ============
  
  async createTask(input: CreateTaskInput): Promise<Task> {
    const now = new Date().toISOString();
    const taskId = `task-${randomUUID().slice(0, 8)}`;
    
    // Find coordinator (default to first orchestration agent or any agent)
    let coordinatorId = input.coordinatorAgentId;
    if (!coordinatorId) {
      const orchestrator = Array.from(this.agents.values())
        .find(a => a.domain === 'orchestration' && a.status === 'active');
      coordinatorId = orchestrator?.id || 'system';
    }
    
    const task: Task = {
      id: taskId,
      prompt: input.prompt,
      goal: input.prompt, // Will be refined by decomposition
      status: 'pending',
      priority: input.priority || 'medium',
      subtasks: [],
      coordinatorAgentId: coordinatorId,
      createdAt: now,
      escalatedToHuman: false,
    };
    
    this.tasks.set(taskId, task);
    return task;
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getAllTasks(limit = 50): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async updateTaskStatus(id: string, status: TaskStatus, result?: string): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updated: Task = {
      ...task,
      status,
      result: result || task.result,
      completedAt: ['completed', 'failed', 'cancelled'].includes(status) 
        ? new Date().toISOString() 
        : task.completedAt,
      startedAt: status === 'in_progress' && !task.startedAt 
        ? new Date().toISOString() 
        : task.startedAt,
    };
    
    this.tasks.set(id, updated);
    return updated;
  }

  async updateSubtask(taskId: string, subtaskId: string, update: Partial<Subtask>): Promise<Task | undefined> {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;
    
    const subtaskIndex = task.subtasks.findIndex(s => s.id === subtaskId);
    if (subtaskIndex === -1) return undefined;
    
    task.subtasks[subtaskIndex] = {
      ...task.subtasks[subtaskIndex],
      ...update,
    };
    
    this.tasks.set(taskId, task);
    return task;
  }

  async assignSubtaskToAgent(taskId: string, subtaskId: string, agentId: string): Promise<Task | undefined> {
    return this.updateSubtask(taskId, subtaskId, {
      assignedAgentId: agentId,
      status: 'assigned',
    });
  }

  async findAgentForTaskType(taskType: TaskType): Promise<AgentRecord | undefined> {
    const rule = DEFAULT_ROUTING_RULES.find(r => r.taskType === taskType);
    if (!rule) return undefined;
    
    const activeAgents = Array.from(this.agents.values())
      .filter(a => a.status === 'active' || a.status === 'idle');
    
    // Try preferred domains first
    for (const domain of rule.preferredDomains) {
      const agent = activeAgents.find(a => a.domain === domain);
      if (agent) {
        // Check required integrations if specified
        if (rule.requiredIntegrations) {
          const hasIntegrations = rule.requiredIntegrations.some(
            req => agent.integrations.includes(req)
          );
          if (hasIntegrations) return agent;
        } else {
          return agent;
        }
      }
    }
    
    // Fallback to any agent in fallback domain
    return activeAgents.find(a => a.domain === rule.fallbackDomain);
  }

  // Add subtasks to a task (used by decomposition)
  async addSubtasksToTask(taskId: string, subtasks: Omit<Subtask, 'id' | 'parentTaskId' | 'createdAt'>[]): Promise<Task | undefined> {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;
    
    const now = new Date().toISOString();
    const newSubtasks: Subtask[] = subtasks.map((st, idx) => ({
      ...st,
      id: `subtask-${randomUUID().slice(0, 8)}`,
      parentTaskId: taskId,
      createdAt: now,
      order: task.subtasks.length + idx,
    }));
    
    task.subtasks.push(...newSubtasks);
    this.tasks.set(taskId, task);
    return task;
  }
}

export const storage = new MemStorage();
