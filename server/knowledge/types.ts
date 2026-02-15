// Knowledge Graph Types for OpenOrca + TrustGraph Integration

export interface KnowledgeNode {
  id: string;
  type: 'entity' | 'concept' | 'fact' | 'decision' | 'observation' | 'task' | 'agent';
  content: string;
  metadata?: Record<string, any>;
  source: {
    agentId: string;
    agentName?: string;
    taskId?: string;
    timestamp: string;
  };
}

export interface KnowledgeEdge {
  id: string;
  fromNode: string;
  toNode: string;
  relationship: KnowledgeRelationType;
  confidence: number;
  metadata?: Record<string, any>;
  source: {
    agentId: string;
    timestamp: string;
  };
}

export type KnowledgeRelationType =
  | 'relates_to'
  | 'caused_by'
  | 'depends_on'
  | 'created_by'
  | 'assigned_to'
  | 'part_of'
  | 'follows'
  | 'contradicts'
  | 'supports'
  | 'references';

export interface ContextCore {
  id: string;
  name: string;
  description: string;
  nodeCount: number;
  edgeCount: number;
  domains: string[];
  createdAt: string;
  updatedAt: string;
  loadedBy: string[];  // Agent IDs that have this core loaded
  status: 'available' | 'loading' | 'loaded' | 'error';
}

// Query types
export interface KnowledgeQuery {
  query: string;
  type: 'graphrag' | 'vector' | 'traversal' | 'hybrid';
  cores?: string[];
  agentId?: string;
  maxResults?: number;
  minConfidence?: number;
  includeRelationships?: boolean;
}

export interface KnowledgeQueryResult {
  answer: string;
  sources: KnowledgeNode[];
  relationships: KnowledgeEdge[];
  confidence: number;
  queryType: string;
  processingTimeMs: number;
}

// Ingest types
export interface KnowledgeIngest {
  agentId: string;
  agentName?: string;
  taskId?: string;
  content: string;
  type: 'observation' | 'decision' | 'fact' | 'learning' | 'error' | 'success';
  metadata?: Record<string, any>;
  relatedTo?: string[];  // Existing node IDs to link to
  relationships?: {
    nodeId: string;
    type: KnowledgeRelationType;
  }[];
}

export interface KnowledgeIngestResult {
  nodeId: string;
  edgesCreated: number;
  success: boolean;
  error?: string;
}

// Core management
export interface ContextCoreCreate {
  name: string;
  description: string;
  domains: string[];
  ontologyId?: string;
  initialData?: KnowledgeIngest[];
}

export interface ContextCoreLoad {
  coreId: string;
  agentId: string;
}

// Graph stats
export interface KnowledgeStats {
  totalNodes: number;
  totalEdges: number;
  nodesByType: Record<string, number>;
  edgesByType: Record<string, number>;
  activeCores: number;
  totalCores: number;
  lastUpdated: string;
}

// Agent knowledge context
export interface AgentKnowledgeContext {
  agentId: string;
  loadedCores: ContextCore[];
  recentQueries: {
    query: string;
    timestamp: string;
    resultCount: number;
  }[];
  contributions: {
    nodesCreated: number;
    edgesCreated: number;
    lastContribution: string;
  };
}
