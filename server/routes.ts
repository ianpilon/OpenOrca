import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupVoiceWebSocket } from "./voice";
import Anthropic from "@anthropic-ai/sdk";
import { knowledgeRoutes } from "./knowledge";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupVoiceWebSocket(httpServer);

  // Knowledge Graph API (TrustGraph integration)
  app.use("/api/knowledge", knowledgeRoutes);

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
