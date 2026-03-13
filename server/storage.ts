import { type User, type InsertUser, type AgentRecord, type RegisterAgentInput, type UpdateAgentStatusInput, type ActionEntry } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private agents: Map<string, AgentRecord>;
  private actions: ActionEntry[];

  constructor() {
    this.users = new Map();
    this.agents = new Map();
    this.actions = [];
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
}

export const storage = new MemStorage();
