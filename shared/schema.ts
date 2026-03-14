import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============================================
// Agent Registration System
// ============================================

// Agent domains and status types
export const AgentDomainEnum = z.enum(['communications', 'productivity', 'research', 'development', 'automation', 'orchestration']);
export const AgentStatusEnum = z.enum(['active', 'idle', 'waiting', 'offline', 'intervention_required']);
export const GraphAccessEnum = z.enum(['read', 'write', 'admin']);

export type AgentDomain = z.infer<typeof AgentDomainEnum>;
export type AgentStatus = z.infer<typeof AgentStatusEnum>;
export type GraphAccess = z.infer<typeof GraphAccessEnum>;

// Integration types
export const IntegrationEnum = z.enum([
  'whatsapp', 'telegram', 'discord', 'slack', 'signal', 'imessage', 'email',
  'browser', 'files', 'terminal', 'calendar', 'notes', 'github', 'gmail', 'voice'
]);
export type Integration = z.infer<typeof IntegrationEnum>;

// Agent registration schema
export const registerAgentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  machineId: z.string().min(1),
  machineName: z.string().min(1),
  domain: AgentDomainEnum,
  integrations: z.array(IntegrationEnum).default([]),
  loadedCores: z.array(z.string()).default([]),
  graphAccess: GraphAccessEnum.default('read'),
  gatewayUrl: z.string().url().optional(),
  gatewayToken: z.string().optional(),
});

export type RegisterAgentInput = z.infer<typeof registerAgentSchema>;

// Full agent record (after registration)
export const agentRecordSchema = registerAgentSchema.extend({
  status: AgentStatusEnum.default('active'),
  currentTaskId: z.string().nullable().default(null),
  currentAction: z.string().default('Initializing...'),
  memoryUsage: z.number().min(0).max(100).default(0),
  uptime: z.string().default('0h'),
  tasksCompleted: z.number().default(0),
  collaboratingWith: z.array(z.string()).default([]),
  interventionRequired: z.boolean().default(false),
  interventionReason: z.string().optional(),
  activityLevel: z.number().min(0).max(100).default(50),
  knowledgeContributions: z.number().default(0),
  lastGraphQuery: z.string().optional(),
  registeredAt: z.string(),
  lastHeartbeat: z.string(),
});

export type AgentRecord = z.infer<typeof agentRecordSchema>;

// Status update schema
export const updateAgentStatusSchema = z.object({
  status: AgentStatusEnum.optional(),
  currentAction: z.string().optional(),
  currentTaskId: z.string().nullable().optional(),
  activityLevel: z.number().min(0).max(100).optional(),
  memoryUsage: z.number().min(0).max(100).optional(),
  interventionRequired: z.boolean().optional(),
  interventionReason: z.string().optional(),
});

export type UpdateAgentStatusInput = z.infer<typeof updateAgentStatusSchema>;

// Action log entry schema
export const actionEntrySchema = z.object({
  id: z.string(),
  agentId: z.string(),
  timestamp: z.string(),
  type: z.enum(['email_sent', 'message_sent', 'file_modified', 'browser_action', 'calendar_update', 'command_run', 'api_call', 'decision', 'orchestration']),
  description: z.string(),
  details: z.string().optional(),
  integration: IntegrationEnum,
  outcome: z.enum(['success', 'failure', 'pending']),
  requiresApproval: z.boolean().default(false),
});

export type ActionEntry = z.infer<typeof actionEntrySchema>;

// ============================================
// Task Routing & Orchestration System
// ============================================

// Task priority and status
export const TaskPriorityEnum = z.enum(['low', 'medium', 'high', 'critical']);
export const TaskStatusEnum = z.enum(['pending', 'assigned', 'in_progress', 'waiting_approval', 'completed', 'failed', 'cancelled']);
export const TaskTypeEnum = z.enum([
  'research',      // Web search, data gathering, analysis
  'development',   // Code writing, debugging, git operations
  'communication', // Messaging, email, notifications
  'automation',    // Cron jobs, file operations, workflows
  'orchestration', // Multi-agent coordination
  'general',       // Catch-all
]);

export type TaskPriority = z.infer<typeof TaskPriorityEnum>;
export type TaskStatus = z.infer<typeof TaskStatusEnum>;
export type TaskType = z.infer<typeof TaskTypeEnum>;

// Subtask schema (for decomposed tasks)
export const subtaskSchema = z.object({
  id: z.string(),
  parentTaskId: z.string(),
  type: TaskTypeEnum,
  description: z.string(),
  assignedAgentId: z.string().nullable(),
  status: TaskStatusEnum,
  priority: TaskPriorityEnum,
  input: z.string().optional(),
  output: z.string().optional(),
  createdAt: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  order: z.number(), // Execution order
});

export type Subtask = z.infer<typeof subtaskSchema>;

// Main task schema
export const taskSchema = z.object({
  id: z.string(),
  prompt: z.string(),                    // Original user input
  goal: z.string(),                      // Extracted goal
  status: TaskStatusEnum,
  priority: TaskPriorityEnum,
  subtasks: z.array(subtaskSchema),
  coordinatorAgentId: z.string(),        // Who manages this task
  createdAt: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  result: z.string().optional(),         // Final synthesized result
  escalatedToHuman: z.boolean().default(false),
  escalationReason: z.string().optional(),
});

export type Task = z.infer<typeof taskSchema>;

// Create task input
export const createTaskSchema = z.object({
  prompt: z.string().min(1),
  priority: TaskPriorityEnum.default('medium'),
  coordinatorAgentId: z.string().optional(), // Defaults to first orchestration agent
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

// Task routing rules - which domains handle which task types
export const routingRulesSchema = z.object({
  taskType: TaskTypeEnum,
  preferredDomains: z.array(AgentDomainEnum),
  requiredIntegrations: z.array(IntegrationEnum).optional(),
  fallbackDomain: AgentDomainEnum,
});

export type RoutingRule = z.infer<typeof routingRulesSchema>;

// Default routing rules
export const DEFAULT_ROUTING_RULES: RoutingRule[] = [
  { taskType: 'research', preferredDomains: ['research'], requiredIntegrations: ['browser'], fallbackDomain: 'research' },
  { taskType: 'development', preferredDomains: ['development'], requiredIntegrations: ['terminal', 'github'], fallbackDomain: 'development' },
  { taskType: 'communication', preferredDomains: ['communications'], requiredIntegrations: ['whatsapp', 'email'], fallbackDomain: 'communications' },
  { taskType: 'automation', preferredDomains: ['automation'], requiredIntegrations: ['files'], fallbackDomain: 'automation' },
  { taskType: 'orchestration', preferredDomains: ['orchestration'], fallbackDomain: 'orchestration' },
  { taskType: 'general', preferredDomains: ['orchestration', 'research'], fallbackDomain: 'orchestration' },
];
