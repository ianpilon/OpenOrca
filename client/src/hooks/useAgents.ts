import { useState, useEffect, useCallback } from 'react';
import type { ClawAgent, ActionEntry } from '../lib/clawData';

const API_BASE = '';

interface AgentRecord {
  id: string;
  name: string;
  machineId: string;
  machineName: string;
  domain: string;
  status: string;
  integrations: string[];
  currentTaskId: string | null;
  currentAction: string;
  memoryUsage: number;
  uptime: string;
  tasksCompleted: number;
  collaboratingWith: string[];
  interventionRequired: boolean;
  interventionReason?: string;
  activityLevel: number;
  loadedCores: string[];
  knowledgeContributions: number;
  lastGraphQuery?: string;
  graphAccess: string;
  registeredAt: string;
  lastHeartbeat: string;
}

// Convert API response to ClawAgent format
function toClawAgent(record: AgentRecord): ClawAgent {
  return {
    id: record.id,
    name: record.name,
    machineId: record.machineId,
    machineName: record.machineName,
    status: record.status as ClawAgent['status'],
    domain: record.domain as ClawAgent['domain'],
    integrations: record.integrations as ClawAgent['integrations'],
    currentTaskId: record.currentTaskId,
    currentAction: record.currentAction,
    memoryUsage: record.memoryUsage,
    uptime: record.uptime,
    tasksCompleted: record.tasksCompleted,
    collaboratingWith: record.collaboratingWith,
    interventionRequired: record.interventionRequired,
    interventionReason: record.interventionReason,
    activityLevel: record.activityLevel,
    loadedCores: record.loadedCores,
    knowledgeContributions: record.knowledgeContributions,
    lastGraphQuery: record.lastGraphQuery,
    graphAccess: record.graphAccess as ClawAgent['graphAccess'],
  };
}

export function useAgents() {
  const [agents, setAgents] = useState<ClawAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/agents`);
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      setAgents(data.agents.map(toClawAgent));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // WebSocket for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/agents`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'agent_registered':
          setAgents(prev => {
            const exists = prev.find(a => a.id === message.data.id);
            if (exists) {
              return prev.map(a => a.id === message.data.id ? toClawAgent(message.data) : a);
            }
            return [...prev, toClawAgent(message.data)];
          });
          break;
          
        case 'agent_status_changed':
          setAgents(prev => 
            prev.map(a => a.id === message.data.id ? toClawAgent(message.data) : a)
          );
          break;
          
        case 'agent_removed':
          setAgents(prev => prev.filter(a => a.id !== message.data.id));
          break;
      }
    };

    ws.onerror = () => {
      console.warn('[useAgents] WebSocket error, falling back to polling');
    };

    return () => ws.close();
  }, []);

  return { agents, loading, error, refetch: fetchAgents };
}

export function useAgentActions(agentId?: string) {
  const [actions, setActions] = useState<ActionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActions() {
      try {
        const url = agentId 
          ? `${API_BASE}/api/agents/${agentId}/actions`
          : `${API_BASE}/api/actions`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch actions');
        const data = await response.json();
        setActions(data.actions);
      } catch (err) {
        console.error('[useAgentActions]', err);
      } finally {
        setLoading(false);
      }
    }

    fetchActions();
  }, [agentId]);

  return { actions, loading };
}
