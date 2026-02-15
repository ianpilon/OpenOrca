// Knowledge API Routes for OpenOrca
// Exposes TrustGraph operations to the frontend and agents

import { Router, type Request, type Response } from 'express';
import { trustGraphClient } from './client';
import type {
  KnowledgeQuery,
  KnowledgeIngest,
  ContextCoreCreate,
} from './types';

const router = Router();

// Health check for knowledge layer
router.get('/health', async (_req: Request, res: Response) => {
  const health = await trustGraphClient.healthCheck();
  res.json(health);
});

// Get knowledge graph stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await trustGraphClient.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting knowledge stats:', error);
    res.status(500).json({ error: 'Failed to get knowledge stats' });
  }
});

// Query the knowledge graph
router.post('/query', async (req: Request, res: Response) => {
  try {
    const query: KnowledgeQuery = {
      query: req.body.query,
      type: req.body.type || 'hybrid',
      cores: req.body.cores,
      agentId: req.body.agentId,
      maxResults: req.body.maxResults,
      minConfidence: req.body.minConfidence,
      includeRelationships: req.body.includeRelationships,
    };

    if (!query.query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const result = await trustGraphClient.query(query);
    res.json(result);
  } catch (error) {
    console.error('Error querying knowledge:', error);
    res.status(500).json({ error: 'Failed to query knowledge' });
  }
});

// Ingest knowledge into the graph
router.post('/ingest', async (req: Request, res: Response) => {
  try {
    const ingest: KnowledgeIngest = {
      agentId: req.body.agentId,
      agentName: req.body.agentName,
      taskId: req.body.taskId,
      content: req.body.content,
      type: req.body.type || 'observation',
      metadata: req.body.metadata,
      relatedTo: req.body.relatedTo,
      relationships: req.body.relationships,
    };

    if (!ingest.agentId || !ingest.content) {
      return res.status(400).json({ error: 'agentId and content are required' });
    }

    const result = await trustGraphClient.ingest(ingest);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error ingesting knowledge:', error);
    res.status(500).json({ error: 'Failed to ingest knowledge' });
  }
});

// Vector search
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, coreId, limit } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await trustGraphClient.vectorSearch(query, coreId, limit);
    res.json({ results });
  } catch (error) {
    console.error('Error searching knowledge:', error);
    res.status(500).json({ error: 'Failed to search knowledge' });
  }
});

// Get related nodes
router.get('/nodes/:nodeId/related', async (req: Request, res: Response) => {
  try {
    const { nodeId } = req.params;
    const depth = parseInt(req.query.depth as string) || 1;

    const result = await trustGraphClient.getRelatedNodes(nodeId, depth);
    res.json(result);
  } catch (error) {
    console.error('Error getting related nodes:', error);
    res.status(500).json({ error: 'Failed to get related nodes' });
  }
});

// === Context Cores ===

// List all context cores
router.get('/cores', async (_req: Request, res: Response) => {
  try {
    const cores = await trustGraphClient.listCores();
    res.json({ cores });
  } catch (error) {
    console.error('Error listing cores:', error);
    res.status(500).json({ error: 'Failed to list cores' });
  }
});

// Get a specific core
router.get('/cores/:coreId', async (req: Request, res: Response) => {
  try {
    const { coreId } = req.params;
    const core = await trustGraphClient.getCore(coreId);
    
    if (core) {
      res.json(core);
    } else {
      res.status(404).json({ error: 'Core not found' });
    }
  } catch (error) {
    console.error('Error getting core:', error);
    res.status(500).json({ error: 'Failed to get core' });
  }
});

// Create a new context core
router.post('/cores', async (req: Request, res: Response) => {
  try {
    const params: ContextCoreCreate = {
      name: req.body.name,
      description: req.body.description,
      domains: req.body.domains || [],
      ontologyId: req.body.ontologyId,
    };

    if (!params.name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const core = await trustGraphClient.createCore(params);
    
    if (core) {
      res.status(201).json(core);
    } else {
      res.status(500).json({ error: 'Failed to create core' });
    }
  } catch (error) {
    console.error('Error creating core:', error);
    res.status(500).json({ error: 'Failed to create core' });
  }
});

// Load a core for an agent
router.post('/cores/:coreId/load', async (req: Request, res: Response) => {
  try {
    const { coreId } = req.params;
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({ error: 'agentId is required' });
    }

    const success = await trustGraphClient.loadCore(coreId, agentId);
    
    if (success) {
      res.json({ success: true, message: `Core ${coreId} loaded for agent ${agentId}` });
    } else {
      res.status(500).json({ error: 'Failed to load core' });
    }
  } catch (error) {
    console.error('Error loading core:', error);
    res.status(500).json({ error: 'Failed to load core' });
  }
});

// Unload a core for an agent
router.post('/cores/:coreId/unload', async (req: Request, res: Response) => {
  try {
    const { coreId } = req.params;
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({ error: 'agentId is required' });
    }

    const success = await trustGraphClient.unloadCore(coreId, agentId);
    
    if (success) {
      res.json({ success: true, message: `Core ${coreId} unloaded for agent ${agentId}` });
    } else {
      res.status(500).json({ error: 'Failed to unload core' });
    }
  } catch (error) {
    console.error('Error unloading core:', error);
    res.status(500).json({ error: 'Failed to unload core' });
  }
});

export default router;
