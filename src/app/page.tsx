'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Database,
  Brain,
  Network,
  MemoryStick,
  FileText,
  Users,
  Calendar,
  Search,
  Upload,
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import MemorySearchClient from '@/components/MemorySearchClient';

// Types
interface AgentStatus {
  name: string;
  port: number;
  status: 'online' | 'offline' | 'error';
  lastSeen: string;
  responseTime: number;
}

interface DatabaseRecord {
  id: string;
  type: string;
  data: any;
  timestamp: string;
}

interface Neo4jNode {
  id: string;
  labels: string[];
  properties: any;
}

interface Neo4jRelationship {
  id: string;
  type: string;
  startNode: string;
  endNode: string;
  properties: any;
}

interface QdrantCollection {
  name: string;
  vector_size: number;
  points_count: number;
}

interface MemoryData {
  type: string;
  data: any;
  timestamp: string;
}

interface SearchResult {
  answer: string;
  source: string;
  confidence: number;
  category: string;
  memory_type?: string;
  sources_count: number;
  related_topics: string[];
  timestamp: string;
}


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [databaseRecords, setDatabaseRecords] = useState<DatabaseRecord[]>([]);
  const [neo4jData, setNeo4jData] = useState<{ nodes: Neo4jNode[], relationships: Neo4jRelationship[] }>({ nodes: [], relationships: [] });
  const [qdrantCollections, setQdrantCollections] = useState<QdrantCollection[]>([]);
  const [memoryData, setMemoryData] = useState<MemoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Agent configurations
  const agents = [
    { name: 'Root Agent', port: 8000, description: 'Central orchestrator' },
    { name: 'JD Generator', port: 8001, description: 'Job description creation' },
    { name: 'Resume Analyzer', port: 8002, description: 'Resume analysis and scoring' },
    { name: 'Interview Scheduler', port: 8003, description: 'Interview scheduling' },
    // Mem0 Service removed - using local HRMemoryManager instead
  ];

  // Check agent health
  const checkAgentHealth = async (port: number) => {
    try {
      const startTime = Date.now();
      const response = await fetch(`http://localhost:${port}/health`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return { status: 'online' as const, responseTime };
      } else {
        return { status: 'error' as const, responseTime: 0 };
      }
    } catch (error) {
      return { status: 'offline' as const, responseTime: 0 };
    }
  };

  // Load all data
  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check agent health
      const healthChecks = await Promise.allSettled(
        agents.map(async (agent) => {
          const health = await checkAgentHealth(agent.port);
          return {
            name: agent.name,
            port: agent.port,
            ...health,
            lastSeen: new Date().toISOString()
          };
        })
      );

      const statuses = healthChecks
        .filter((result): result is PromiseFulfilledResult<AgentStatus> => result.status === 'fulfilled')
        .map(result => result.value);
      
      setAgentStatuses(statuses);

      // Load database records (simulated for now)
      const mockRecords: DatabaseRecord[] = [
        { id: '1', type: 'job', data: { title: 'Senior Developer', company: 'TechCorp' }, timestamp: new Date().toISOString() },
        { id: '2', type: 'candidate', data: { name: 'John Doe', skills: ['Python', 'React'] }, timestamp: new Date().toISOString() },
        { id: '3', type: 'resume', data: { score: 85, analysis: 'Strong match' }, timestamp: new Date().toISOString() },
      ];
      setDatabaseRecords(mockRecords);

      // Load Neo4j data (simulated)
      const mockNeo4jData = {
        nodes: [
          { id: '1', labels: ['Company'], properties: { name: 'TechCorp Solutions' } },
          { id: '2', labels: ['Skill'], properties: { name: 'Python' } },
          { id: '3', labels: ['Candidate'], properties: { name: 'Sarah Johnson' } },
        ],
        relationships: [
          { id: '1', type: 'REQUIRES', startNode: '1', endNode: '2', properties: {} },
          { id: '2', type: 'HAS_SKILL', startNode: '3', endNode: '2', properties: {} },
        ]
      };
      setNeo4jData(mockNeo4jData);

      // Load Qdrant collections (simulated)
      const mockCollections: QdrantCollection[] = [
        { name: 'resumes', vector_size: 768, points_count: 150 },
        { name: 'job_descriptions', vector_size: 768, points_count: 75 },
        { name: 'candidates', vector_size: 768, points_count: 200 },
      ];
      setQdrantCollections(mockCollections);

      // Load memory data (simulated)
      const mockMemoryData: MemoryData[] = [
        { type: 'short_term', data: { recent_searches: ['python developer', 'ml engineer'] }, timestamp: new Date().toISOString() },
        { type: 'long_term', data: { total_candidates: 150, successful_hires: 23 }, timestamp: new Date().toISOString() },
        { type: 'episodic', data: { recent_interviews: ['Sarah Johnson - Hired', 'Mike Chen - Pending'] }, timestamp: new Date().toISOString() },
      ];
      setMemoryData(mockMemoryData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'error': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'offline': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'error': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 AI Dashboard
          </h1>
          <p className="text-gray-600">
            Comprehensive view of all AI agents, databases, and system status
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="databases">Databases</TabsTrigger>
            <TabsTrigger value="neo4j">Knowledge Graph</TabsTrigger>
            <TabsTrigger value="qdrant">Vector Search</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* System Status */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Healthy</div>
                  <p className="text-xs text-muted-foreground">
                    All core services operational
                  </p>
                </CardContent>
              </Card>

              {/* Active Agents */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                  <Brain className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {agentStatuses.filter(a => a.status === 'online').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    of {agents.length} agents running
                  </p>
                </CardContent>
              </Card>

              {/* Database Records */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                  <Database className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {databaseRecords.length + neo4jData.nodes.length + qdrantCollections.reduce((sum, c) => sum + c.points_count, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    across all databases
                  </p>
                </CardContent>
              </Card>

              {/* Memory Usage */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory Types</CardTitle>
                  <MemoryStick className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {memoryData.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    memory types active
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={loadAllData} disabled={isLoading} className="w-full">
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Resume
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Agent Status</CardTitle>
                <CardDescription>
                  Real-time status of all AI agents and their performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agentStatuses.map((agent) => (
                    <div key={agent.port} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(agent.status)}
                        <div>
                          <h3 className="font-medium">{agent.name}</h3>
                          <p className="text-sm text-gray-500">Port {agent.port}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={agent.status === 'online' ? 'default' : 'destructive'}>
                          {agent.status}
                        </Badge>
                        {agent.status === 'online' && (
                          <span className="text-sm text-gray-500">
                            {agent.responseTime}ms
                          </span>
                        )}
                        <span className="text-sm text-gray-400">
                          {new Date(agent.lastSeen).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Databases Tab */}
          <TabsContent value="databases" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Records</CardTitle>
                <CardDescription>
                  Recent records from PostgreSQL database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {databaseRecords.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{record.type}</Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(record.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <pre className="text-sm bg-gray-50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(record.data, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Neo4j Tab */}
          <TabsContent value="neo4j" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Graph (Neo4j)</CardTitle>
                <CardDescription>
                  Graph relationships and node data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Nodes */}
                  <div>
                    <h3 className="font-medium mb-3">Nodes ({neo4jData.nodes.length})</h3>
                    <div className="space-y-2">
                      {neo4jData.nodes.map((node) => (
                        <div key={node.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{node.labels.join(', ')}</Badge>
                            <span className="text-sm text-gray-500">ID: {node.id}</span>
                          </div>
                          <pre className="text-sm bg-gray-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(node.properties, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Relationships */}
                  <div>
                    <h3 className="font-medium mb-3">Relationships ({neo4jData.relationships.length})</h3>
                    <div className="space-y-2">
                      {neo4jData.relationships.map((rel) => (
                        <div key={rel.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary">{rel.type}</Badge>
                            <span className="text-sm text-gray-500">ID: {rel.id}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{rel.startNode}</span>
                            <span className="mx-2">→</span>
                            <span className="font-medium">{rel.endNode}</span>
                          </div>
                          {Object.keys(rel.properties).length > 0 && (
                            <pre className="text-sm bg-gray-50 p-2 rounded mt-2 overflow-x-auto">
                              {JSON.stringify(rel.properties, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Qdrant Tab */}
          <TabsContent value="qdrant" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vector Database (Qdrant)</CardTitle>
                <CardDescription>
                  Vector collections and similarity search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Collections Overview */}
                  <div>
                    <h3 className="font-medium mb-3">Collections</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {qdrantCollections.map((collection) => (
                        <div key={collection.name} className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">{collection.name}</h4>
                          <div className="space-y-2 text-sm">
                            <div>Vector Size: {collection.vector_size}</div>
                            <div>Points: {collection.points_count}</div>
                            <Progress value={(collection.points_count / 1000) * 100} className="w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Similarity Search */}
                  <div>
                    <h3 className="font-medium mb-3">Similarity Search</h3>
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <Input placeholder="Enter search query..." />
                        <Select>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Collection" />
                          </SelectTrigger>
                          <SelectContent>
                            {qdrantCollections.map((collection) => (
                              <SelectItem key={collection.name} value={collection.name}>
                                {collection.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button>
                          <Search className="w-4 h-4 mr-2" />
                          Search
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memory Tab */}
          <TabsContent value="memory" className="space-y-6">
            {/* Memory Search */}
            <Card>
              <CardHeader>
                <CardTitle>Intelligent Memory Search</CardTitle>
                <CardDescription>
                  Search the Imercfy knowledge base with intelligent retrieval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MemorySearchClient />
              </CardContent>
            </Card>

            {/* Memory Types Display */}
            <Card>
              <CardHeader>
                <CardTitle>Memory Types</CardTitle>
                <CardDescription>
                  Different types of memory and their contents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {memoryData.map((memory) => (
                    <div key={memory.type} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="capitalize">
                          {memory.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(memory.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
                        {JSON.stringify(memory.data, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
