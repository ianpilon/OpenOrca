import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupVoiceWebSocket } from "./voice";
import Anthropic from "@anthropic-ai/sdk";
import { knowledgeRoutes } from "./knowledge";
import { 
  registerAgentSchema, updateAgentStatusSchema, createTaskSchema,
  TaskTypeEnum, type TaskType, type Subtask 
} from "@shared/schema";

// WebSocket clients for real-time agent updates
const agentClients = new Set<WebSocket>();

function broadcastAgentUpdate(type: string, data: any) {
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  agentClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Task decomposition - analyzes prompt and breaks into typed subtasks
async function decomposeTask(prompt: string): Promise<Omit<Subtask, 'id' | 'parentTaskId' | 'createdAt'>[]> {
  const subtasks: Omit<Subtask, 'id' | 'parentTaskId' | 'createdAt'>[] = [];
  const promptLower = prompt.toLowerCase();
  
  // Pattern matching for task types
  const patterns: { pattern: RegExp | string[]; type: TaskType; description: string }[] = [
    { 
      pattern: ['search', 'find', 'research', 'look up', 'analyze', 'summarize', 'read'],
      type: 'research',
      description: 'Research and gather information'
    },
    {
      pattern: ['code', 'write', 'create file', 'fix bug', 'implement', 'debug', 'git', 'commit', 'push', 'deploy'],
      type: 'development',
      description: 'Development and code operations'
    },
    {
      pattern: ['send', 'message', 'email', 'notify', 'contact', 'reply', 'whatsapp', 'telegram'],
      type: 'communication',
      description: 'Send communication'
    },
    {
      pattern: ['schedule', 'automate', 'cron', 'reminder', 'workflow', 'organize', 'file'],
      type: 'automation',
      description: 'Automation and file operations'
    },
    {
      pattern: ['coordinate', 'orchestrate', 'manage', 'delegate', 'assign'],
      type: 'orchestration',
      description: 'Coordinate multiple agents'
    },
  ];
  
  let order = 0;
  const matchedTypes = new Set<TaskType>();
  
  // Find matching patterns
  for (const { pattern, type, description } of patterns) {
    const matches = Array.isArray(pattern)
      ? pattern.some(p => promptLower.includes(p))
      : pattern.test(promptLower);
    
    if (matches && !matchedTypes.has(type)) {
      matchedTypes.add(type);
      subtasks.push({
        type,
        description: `${description}: ${prompt.slice(0, 100)}${prompt.length > 100 ? '...' : ''}`,
        assignedAgentId: null,
        status: 'pending',
        priority: 'medium',
        order: order++,
      });
    }
  }
  
  // If no specific patterns matched, create a general task
  if (subtasks.length === 0) {
    subtasks.push({
      type: 'general',
      description: prompt,
      assignedAgentId: null,
      status: 'pending',
      priority: 'medium',
      order: 0,
    });
  }
  
  // Add synthesis subtask if multiple subtasks (orchestration needed)
  if (subtasks.length > 1) {
    subtasks.push({
      type: 'orchestration',
      description: 'Synthesize results from all subtasks',
      assignedAgentId: null,
      status: 'pending',
      priority: 'medium',
      order: order++,
    });
  }
  
  return subtasks;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupVoiceWebSocket(httpServer);

  // WebSocket for real-time agent updates
  const agentWss = new WebSocketServer({ server: httpServer, path: '/ws/agents' });
  agentWss.on('connection', (ws) => {
    agentClients.add(ws);
    ws.on('close', () => agentClients.delete(ws));
  });

  // Knowledge Graph API (TrustGraph integration)
  app.use("/api/knowledge", knowledgeRoutes);

  // ============================================
  // Agent Registration API
  // ============================================

  // Register a new agent (or update existing)
  app.post("/api/agents/register", async (req: Request, res: Response) => {
    const parsed = registerAgentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid agent data", details: parsed.error.issues });
    }

    try {
      const agent = await storage.registerAgent(parsed.data);
      broadcastAgentUpdate('agent_registered', agent);
      console.log(`[OpenOrca] Agent registered: ${agent.name} (${agent.id})`);
      return res.json({ success: true, agent });
    } catch (error: any) {
      console.error("[OpenOrca] Agent registration error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get all registered agents
  app.get("/api/agents", async (_req: Request, res: Response) => {
    try {
      const agents = await storage.getAllAgents();
      return res.json({ agents });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get a specific agent
  app.get("/api/agents/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      return res.json({ agent });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Update agent status
  app.put("/api/agents/:id/status", async (req: Request, res: Response) => {
    const { id } = req.params;
    const parsed = updateAgentStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid status update", details: parsed.error.issues });
    }

    try {
      const agent = await storage.updateAgentStatus(id, parsed.data);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      broadcastAgentUpdate('agent_status_changed', agent);
      return res.json({ success: true, agent });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Agent heartbeat (keep-alive)
  app.post("/api/agents/:id/heartbeat", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const agent = await storage.heartbeat(id);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      return res.json({ success: true, agent });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Remove an agent
  app.delete("/api/agents/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const removed = await storage.removeAgent(id);
      if (!removed) {
        return res.status(404).json({ error: "Agent not found" });
      }
      broadcastAgentUpdate('agent_removed', { id });
      console.log(`[OpenOrca] Agent removed: ${id}`);
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Log an action
  app.post("/api/agents/:id/action", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { type, description, details, integration, outcome, requiresApproval } = req.body;

    if (!type || !description || !integration) {
      return res.status(400).json({ error: "Missing required fields: type, description, integration" });
    }

    try {
      const action = await storage.logAction({
        agentId: id,
        type,
        description,
        details,
        integration,
        outcome: outcome || 'success',
        requiresApproval: requiresApproval || false,
      });
      broadcastAgentUpdate('action_logged', action);
      return res.json({ success: true, action });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get action log for an agent
  app.get("/api/agents/:id/actions", async (req: Request, res: Response) => {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    try {
      const actions = await storage.getAgentActions(id, limit);
      return res.json({ actions });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get all actions
  app.get("/api/actions", async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 100;
    try {
      const actions = await storage.getAllActions(limit);
      return res.json({ actions });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // Task Routing & Orchestration API
  // ============================================

  // Create a new task (with automatic decomposition)
  app.post("/api/tasks", async (req: Request, res: Response) => {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid task data", details: parsed.error.issues });
    }

    try {
      const task = await storage.createTask(parsed.data);
      
      // Auto-decompose the task into subtasks based on prompt analysis
      const subtasks = await decomposeTask(task.prompt);
      if (subtasks.length > 0) {
        await storage.addSubtasksToTask(task.id, subtasks);
      }
      
      // Auto-route subtasks to available agents
      const updatedTask = await storage.getTask(task.id);
      if (updatedTask) {
        for (const subtask of updatedTask.subtasks) {
          const agent = await storage.findAgentForTaskType(subtask.type);
          if (agent) {
            await storage.assignSubtaskToAgent(task.id, subtask.id, agent.id);
          }
        }
      }
      
      const finalTask = await storage.getTask(task.id);
      broadcastAgentUpdate('task_created', finalTask);
      console.log(`[OpenOrca] Task created: ${task.id} with ${finalTask?.subtasks.length || 0} subtasks`);
      
      return res.json({ success: true, task: finalTask });
    } catch (error: any) {
      console.error("[OpenOrca] Task creation error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get all tasks
  app.get("/api/tasks", async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 50;
    try {
      const tasks = await storage.getAllTasks(limit);
      return res.json({ tasks });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get a specific task
  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      return res.json({ task });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Update task status
  app.put("/api/tasks/:id/status", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, result } = req.body;
    
    try {
      const task = await storage.updateTaskStatus(id, status, result);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      broadcastAgentUpdate('task_status_changed', task);
      return res.json({ success: true, task });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Update a subtask
  app.put("/api/tasks/:taskId/subtasks/:subtaskId", async (req: Request, res: Response) => {
    const { taskId, subtaskId } = req.params;
    const update = req.body;
    
    try {
      const task = await storage.updateSubtask(taskId, subtaskId, update);
      if (!task) {
        return res.status(404).json({ error: "Task or subtask not found" });
      }
      broadcastAgentUpdate('subtask_updated', { task, subtaskId });
      return res.json({ success: true, task });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Manually assign a subtask to an agent
  app.post("/api/tasks/:taskId/subtasks/:subtaskId/assign", async (req: Request, res: Response) => {
    const { taskId, subtaskId } = req.params;
    const { agentId } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: "agentId is required" });
    }
    
    try {
      const task = await storage.assignSubtaskToAgent(taskId, subtaskId, agentId);
      if (!task) {
        return res.status(404).json({ error: "Task or subtask not found" });
      }
      broadcastAgentUpdate('subtask_assigned', { task, subtaskId, agentId });
      return res.json({ success: true, task });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Route a task type to find best agent
  app.get("/api/routing/:taskType", async (req: Request, res: Response) => {
    const { taskType } = req.params;
    const parsed = TaskTypeEnum.safeParse(taskType);
    
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid task type", validTypes: TaskTypeEnum.options });
    }
    
    try {
      const agent = await storage.findAgentForTaskType(parsed.data);
      if (!agent) {
        return res.json({ agent: null, message: "No suitable agent found" });
      }
      return res.json({ agent });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/claude/validate", async (req: Request, res: Response) => {
    const { apiKey } = req.body;

    if (!apiKey || typeof apiKey !== "string") {
      return res.status(400).json({ valid: false, error: "API key is required" });
    }

    if (!apiKey.startsWith("sk-ant-")) {
      return res.status(400).json({ valid: false, error: "Invalid API key format" });
    }

    try {
      const client = new Anthropic({ apiKey });
      
      await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 10,
        messages: [{ role: "user", content: "Hi" }],
      });

      return res.json({ valid: true });
    } catch (error: any) {
      console.error("API key validation error:", error.message);
      
      if (error.status === 401) {
        return res.json({ valid: false, error: "Invalid API key" });
      }
      if (error.status === 429) {
        return res.json({ valid: true });
      }
      
      return res.json({ valid: false, error: error.message || "Validation failed" });
    }
  });

  app.post("/api/claude/chat", async (req: Request, res: Response) => {
    const { apiKey, messages, loopContext } = req.body;

    if (!apiKey || typeof apiKey !== "string") {
      return res.status(400).json({ error: "API key is required" });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    try {
      const client = new Anthropic({ apiKey });

      const systemPrompt = `You are Claude Code, an AI coding assistant integrated into the Claw Orchestrator infrastructure orchestration platform. You help developers understand and debug their Ralph loops (recursive AI coding agent loops).

Current context:
${loopContext ? `- Loop: ${loopContext.loopName}
- Mode: ${loopContext.mode} (${loopContext.mode === 'forward' ? 'building new features' : loopContext.mode === 'reverse' ? 'cloning/refactoring' : 'running tests'})
- Goal: ${loopContext.goal}
- Status: ${loopContext.status}
- Iterations: ${loopContext.iterationCount}
${loopContext.interventionReason ? `- Intervention needed: ${loopContext.interventionReason}` : ''}` : 'No specific loop context provided.'}

You can:
- Explain what the loop is doing and why
- Suggest fixes for issues
- Help debug problems
- Provide code snippets
- Analyze the agent's decisions

Keep responses concise but helpful. Use markdown formatting for code blocks.`;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await client.messages.stream({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      });

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error("Claude chat error:", error.message);
      
      if (!res.headersSent) {
        if (error.status === 401) {
          return res.status(401).json({ error: "Invalid API key" });
        }
        if (error.status === 429) {
          return res.status(429).json({ error: "Rate limit exceeded. Please wait and try again." });
        }
        return res.status(500).json({ error: error.message || "Failed to get response" });
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    }
  });

  return httpServer;
}
