// TrustGraph Client for OpenOrca
// Wraps TrustGraph API for knowledge graph operations

import type {
  KnowledgeNode,
  KnowledgeEdge,
  ContextCore,
  KnowledgeQuery,
  KnowledgeQueryResult,
  KnowledgeIngest,
  KnowledgeIngestResult,
  KnowledgeStats,
  ContextCoreCreate,
} from './types';

const TRUSTGRAPH_URL = process.env.TRUSTGRAPH_URL || 'http://localhost:8088';

class TrustGraphClient {
  private baseUrl: string;

  constructor(baseUrl: string = TRUSTGRAPH_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TrustGraph API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; version: string }> {
    try {
      return await this.fetch('/health');
    } catch (error) {
      return { status: 'unavailable', version: 'unknown' };
    }
  }

  // Query the knowledge graph
  async query(params: KnowledgeQuery): Promise<KnowledgeQueryResult> {
    const startTime = Date.now();
    
    try {
      const result = await this.fetch<any>('/api/v1/query', {
        method: 'POST',
        body: JSON.stringify({
          query: params.query,
          query_type: params.type || 'hybrid',
          collections: params.cores,
          max_results: params.maxResults || 10,
          min_confidence: params.minConfidence || 0.5,
          include_relationships: params.includeRelationships ?? true,
          context: params.agentId ? { agent_id: params.agentId } : undefined,
        }),
      });

      return {
        answer: result.answer || '',
        sources: (result.sources || []).map(this.mapToKnowledgeNode),
        relationships: (result.relationships || []).map(this.mapToKnowledgeEdge),
        confidence: result.confidence || 0,
        queryType: params.type || 'hybrid',
        processingTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error('TrustGraph query error:', error);
      return {
        answer: '',
        sources: [],
        relationships: [],
        confidence: 0,
        queryType: params.type || 'hybrid',
        processingTimeMs: Date.now() - startTime,
      };
    }
  }

  // Ingest knowledge into the graph
  async ingest(data: KnowledgeIngest): Promise<KnowledgeIngestResult> {
    try {
      const result = await this.fetch<any>('/api/v1/ingest', {
        method: 'POST',
        body: JSON.stringify({
          content: data.content,
          node_type: data.type,
          metadata: {
            ...data.metadata,
            agent_id: data.agentId,
            agent_name: data.agentName,
            task_id: data.taskId,
          },
          related_nodes: data.relatedTo,
          relationships: data.relationships?.map(r => ({
            target_id: r.nodeId,
            relationship_type: r.type,
          })),
        }),
      });

      return {
        nodeId: result.node_id,
        edgesCreated: result.edges_created || 0,
        success: true,
      };
    } catch (error) {
      console.error('TrustGraph ingest error:', error);
      return {
        nodeId: '',
        edgesCreated: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // List all context cores
  async listCores(): Promise<ContextCore[]> {
    try {
      const result = await this.fetch<any[]>('/api/v1/cores');
      return result.map(this.mapToContextCore);
    } catch (error) {
      console.error('TrustGraph listCores error:', error);
      return [];
    }
  }

  // Get a specific context core
  async getCore(coreId: string): Promise<ContextCore | null> {
    try {
      const result = await this.fetch<any>(`/api/v1/cores/${coreId}`);
      return this.mapToContextCore(result);
    } catch (error) {
      console.error('TrustGraph getCore error:', error);
      return null;
    }
  }

  // Create a new context core
  async createCore(params: ContextCoreCreate): Promise<ContextCore | null> {
    try {
      const result = await this.fetch<any>('/api/v1/cores', {
        method: 'POST',
        body: JSON.stringify({
          name: params.name,
          description: params.description,
          domains: params.domains,
          ontology_id: params.ontologyId,
        }),
      });
      return this.mapToContextCore(result);
    } catch (error) {
      console.error('TrustGraph createCore error:', error);
      return null;
    }
  }

  // Load a context core for an agent
  async loadCore(coreId: string, agentId: string): Promise<boolean> {
    try {
      await this.fetch(`/api/v1/cores/${coreId}/load`, {
        method: 'POST',
        body: JSON.stringify({ agent_id: agentId }),
      });
      return true;
    } catch (error) {
      console.error('TrustGraph loadCore error:', error);
      return false;
    }
  }

  // Unload a context core for an agent
  async unloadCore(coreId: string, agentId: string): Promise<boolean> {
    try {
      await this.fetch(`/api/v1/cores/${coreId}/unload`, {
        method: 'POST',
        body: JSON.stringify({ agent_id: agentId }),
      });
      return true;
    } catch (error) {
      console.error('TrustGraph unloadCore error:', error);
      return false;
    }
  }

  // Get knowledge graph stats
  async getStats(): Promise<KnowledgeStats> {
    try {
      const result = await this.fetch<any>('/api/v1/stats');
      return {
        totalNodes: result.total_nodes || 0,
        totalEdges: result.total_edges || 0,
        nodesByType: result.nodes_by_type || {},
        edgesByType: result.edges_by_type || {},
        activeCores: result.active_cores || 0,
        totalCores: result.total_cores || 0,
        lastUpdated: result.last_updated || new Date().toISOString(),
      };
    } catch (error) {
      console.error('TrustGraph getStats error:', error);
      return {
        totalNodes: 0,
        totalEdges: 0,
        nodesByType: {},
        edgesByType: {},
        activeCores: 0,
        totalCores: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  // Get nodes related to a specific node
  async getRelatedNodes(nodeId: string, depth: number = 1): Promise<{
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
  }> {
    try {
      const result = await this.fetch<any>(`/api/v1/nodes/${nodeId}/related`, {
        method: 'GET',
      });
      return {
        nodes: (result.nodes || []).map(this.mapToKnowledgeNode),
        edges: (result.edges || []).map(this.mapToKnowledgeEdge),
      };
    } catch (error) {
      console.error('TrustGraph getRelatedNodes error:', error);
      return { nodes: [], edges: [] };
    }
  }

  // Vector search
  async vectorSearch(
    query: string,
    coreId?: string,
    limit: number = 10
  ): Promise<KnowledgeNode[]> {
    try {
      const result = await this.fetch<any[]>('/api/v1/search/vector', {
        method: 'POST',
        body: JSON.stringify({
          query,
          collection: coreId,
          limit,
        }),
      });
      return result.map(this.mapToKnowledgeNode);
    } catch (error) {
      console.error('TrustGraph vectorSearch error:', error);
      return [];
    }
  }

  // Helper mappers
  private mapToKnowledgeNode = (raw: any): KnowledgeNode => ({
    id: raw.id || raw.node_id,
    type: raw.type || raw.node_type || 'entity',
    content: raw.content || raw.text || '',
    metadata: raw.metadata,
    source: {
      agentId: raw.metadata?.agent_id || raw.agent_id || 'unknown',
      agentName: raw.metadata?.agent_name || raw.agent_name,
      taskId: raw.metadata?.task_id || raw.task_id,
      timestamp: raw.created_at || raw.timestamp || new Date().toISOString(),
    },
  });

  private mapToKnowledgeEdge = (raw: any): KnowledgeEdge => ({
    id: raw.id || raw.edge_id,
    fromNode: raw.from_node || raw.source,
    toNode: raw.to_node || raw.target,
    relationship: raw.relationship || raw.type || 'relates_to',
    confidence: raw.confidence || 1.0,
    metadata: raw.metadata,
    source: {
      agentId: raw.metadata?.agent_id || raw.agent_id || 'unknown',
      timestamp: raw.created_at || raw.timestamp || new Date().toISOString(),
    },
  });

  private mapToContextCore = (raw: any): ContextCore => ({
    id: raw.id || raw.core_id,
    name: raw.name,
    description: raw.description || '',
    nodeCount: raw.node_count || 0,
    edgeCount: raw.edge_count || 0,
    domains: raw.domains || [],
    createdAt: raw.created_at || new Date().toISOString(),
    updatedAt: raw.updated_at || new Date().toISOString(),
    loadedBy: raw.loaded_by || [],
    status: raw.status || 'available',
  });
}

// Export singleton instance
export const trustGraphClient = new TrustGraphClient();

// Export class for custom instances
export { TrustGraphClient };
