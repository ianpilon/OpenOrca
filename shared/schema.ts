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
