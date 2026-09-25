import { useCallback, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  ReactFlow, Background, Controls, MiniMap, Node, Edge,
  useNodesState, useEdgesState, Position, Handle, MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../store/useStore';
import { ClassTopicAnalysis } from '../types';
import {
  X, TrendingUp, TrendingDown, Clock, Users, ArrowRight,
  AlertTriangle, Lightbulb, Search, Filter, BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Custom Node Component
function TopicNode({ data }: { data: any }) {
  const bgColor = data.status === 'Strong' ? 'bg-green-50 border-green-300' :
    data.status === 'Developing' ? 'bg-amber-50 border-amber-300' :
    'bg-red-50 border-red-300';

  const textColor = data.status === 'Strong' ? 'text-green-800' :
    data.status === 'Developing' ? 'text-amber-800' :
    'text-red-800';

  const scoreColor = data.status === 'Strong' ? 'text-green-600' :
    data.status === 'Developing' ? 'text-amber-600' :
    'text-red-600';

  return (
    <div className={`px-4 py-3 rounded-xl border-2 ${bgColor} shadow-sm min-w-[160px] cursor-pointer hover:shadow-md transition-shadow`}>
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      <div className="text-center">
        <p className={`text-xs font-bold uppercase tracking-wide ${textColor}`}>{data.label}</p>
        <p className={`text-2xl font-bold mt-1 ${scoreColor}`}>{data.score}%</p>
        <p className={`text-xs font-medium mt-1 ${textColor}`}>{data.status}</p>
        <p className="text-xs text-slate-500 mt-1">{data.studentsAssessed} students</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = { topicNode: TopicNode };

export default function KnowledgeMap() {
  const { classId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTopicParam = searchParams.get('topic');
  const { getClassTopicAnalysis, topics, prerequisites, setSelectedTopicId, selectedTopicId } = useStore();
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  const analysis = getClassTopicAnalysis(classId || '');
  const classTopics = topics.filter(t => t.classId === classId);

  // Build nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    // Create a layout based on prerequisite chains
    const topicMap = new Map(classTopics.map(t => [t.id, t]));
    const analysisMap = new Map(analysis.map(a => [a.topicId, a]));

    // Find root topics (no prerequisites within this class)
    const hasPrereqs = new Set(prerequisites.filter(p => topicMap.has(p.topicId)).map(p => p.topicId));
    const rootTopics = classTopics.filter(t => !hasPrereqs.has(t.id));

    // BFS to assign levels
    const levels: Map<string, number> = new Map();
    const queue: { id: string; level: number }[] = rootTopics.map(t => ({ id: t.id, level: 0 }));
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      if (visited.has(id)) {
        if (level > (levels.get(id) || 0)) levels.set(id, level);
        continue;
      }
      visited.add(id);
      levels.set(id, level);

      // Find topics that depend on this one
      const dependents = prerequisites.filter(p => p.prerequisiteId === id && topicMap.has(p.topicId));
      dependents.forEach(d => {
        queue.push({ id: d.topicId, level: level + 1 });
      });
    }

    // Assign unvisited topics
    classTopics.forEach(t => {
      if (!levels.has(t.id)) levels.set(t.id, 0);
    });

    // Group by level for positioning
    const levelGroups: Map<number, string[]> = new Map();
    levels.forEach((level, id) => {
      if (!levelGroups.has(level)) levelGroups.set(level, []);
      levelGroups.get(level)!.push(id);
    });

    const nodes: Node[] = [];
    const maxLevel = Math.max(...Array.from(levels.values()), 0);

    levelGroups.forEach((ids, level) => {
      ids.forEach((id, index) => {
        const topic = topicMap.get(id);
        const topicAnalysis = analysisMap.get(id);
        if (!topic || !topicAnalysis) return;

        if (filter !== 'All' && topicAnalysis.status !== filter) return;
        if (search && !topic.name.toLowerCase().includes(search.toLowerCase())) return;

        const totalAtLevel = ids.length;
        const xOffset = (index - (totalAtLevel - 1) / 2) * 250;

        nodes.push({
          id: topic.id,
          type: 'topicNode',
          position: { x: xOffset + 400, y: level * 180 + 50 },
          data: {
            label: topic.name,
            score: topicAnalysis.averageScore,
            status: topicAnalysis.status,
            studentsAssessed: topicAnalysis.studentsAssessed,
          },
        });
      });
    });

    // Create edges
    const edges: Edge[] = prerequisites
      .filter(p => topicMap.has(p.topicId) && topicMap.has(p.prerequisiteId))
      .map(p => {
        const sourceAnalysis = analysisMap.get(p.prerequisiteId);
        const targetAnalysis = analysisMap.get(p.topicId);
        const color = (targetAnalysis?.status === 'Needs Attention' && sourceAnalysis && sourceAnalysis.averageScore < 70)
          ? '#ef4444' : '#94a3b8';

        return {
          id: `${p.prerequisiteId}-${p.topicId}`,
          source: p.prerequisiteId,
          target: p.topicId,
          type: 'smoothstep',
          animated: color === '#ef4444',
          style: { stroke: color, strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color },
        };
      });

    return { nodes, edges };
  }, [analysis, classTopics, prerequisites, filter, search]);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(initialNodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when initialNodes changes
  useMemo(() => {
    setFlowNodes(initialNodes);
    setFlowEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  const handleNodeClick = useCallback((_: any, node: Node) => {
    setSelectedTopicId(node.id);
    setSearchParams({ topic: node.id });
  }, []);

  const selectedAnalysis = analysis.find(a => a.topicId === (selectedTopicId || selectedTopicParam));

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Main Map Area */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5">
            {['All', 'Strong', 'Developing', 'Needs Attention'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === f ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.3}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#e2e8f0" gap={20} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const status = (node.data as any)?.status;
                return status === 'Strong' ? '#22c55e' : status === 'Developing' ? '#f59e0b' : '#ef4444';
              }}
              maskColor="rgba(0,0,0,0.1)"
            />
          </ReactFlow>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedAnalysis && (
        <div className="w-80 lg:w-96 bg-white rounded-xl border border-slate-200 overflow-y-auto flex-shrink-0">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Topic Details</h3>
            <button
              onClick={() => { setSelectedTopicId(null); setSearchParams({}); }}
              className="p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="p-4 space-y-5">
            {/* Topic Header */}
            <div>
              <h4 className="text-lg font-bold text-slate-800">{selectedAnalysis.topicName}</h4>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                  selectedAnalysis.status === 'Strong' ? 'bg-green-100 text-green-700' :
                  selectedAnalysis.status === 'Developing' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedAnalysis.status === 'Strong' && <TrendingUp className="w-3 h-3 mr-1" />}
                  {selectedAnalysis.status === 'Developing' && <Clock className="w-3 h-3 mr-1" />}
                  {selectedAnalysis.status === 'Needs Attention' && <TrendingDown className="w-3 h-3 mr-1" />}
                  {selectedAnalysis.status}
                </span>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-slate-800">{selectedAnalysis.averageScore}%</p>
                <p className="text-xs text-slate-500">Class Average</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-slate-800">{selectedAnalysis.studentsAssessed}</p>
                <p className="text-xs text-slate-500">Students Assessed</p>
              </div>
            </div>

            {/* Distribution */}
            <div>
              <h5 className="text-sm font-medium text-slate-700 mb-2">Student Distribution</h5>
              <div className="space-y-2">
                <DistributionBar label="Strong" count={selectedAnalysis.strongCount} total={selectedAnalysis.studentsAssessed} color="bg-green-500" />
                <DistributionBar label="Developing" count={selectedAnalysis.developingCount} total={selectedAnalysis.studentsAssessed} color="bg-amber-500" />
                <DistributionBar label="Needs Attention" count={selectedAnalysis.needsAttentionCount} total={selectedAnalysis.studentsAssessed} color="bg-red-500" />
              </div>
            </div>

            {/* Chart */}
            <div>
              <h5 className="text-sm font-medium text-slate-700 mb-2">Distribution Chart</h5>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Strong', value: selectedAnalysis.strongCount, fill: '#22c55e' },
                    { name: 'Developing', value: selectedAnalysis.developingCount, fill: '#f59e0b' },
                    { name: 'Attention', value: selectedAnalysis.needsAttentionCount, fill: '#ef4444' },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {[
                        <Cell key="1" fill="#22c55e" />,
                        <Cell key="2" fill="#f59e0b" />,
                        <Cell key="3" fill="#ef4444" />,
                      ]}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Prerequisites */}
            {selectedAnalysis.prerequisiteIds.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-slate-700 mb-2">Prerequisites</h5>
                <div className="space-y-2">
                  {selectedAnalysis.prerequisiteIds.map(pId => {
                    const prereqAnalysis = analysis.find(a => a.topicId === pId);
                    if (!prereqAnalysis) return null;
                    return (
                      <button
                        key={pId}
                        onClick={() => { setSelectedTopicId(pId); setSearchParams({ topic: pId }); }}
                        className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-left"
                      >
                        <span className="text-sm text-slate-700">{prereqAnalysis.topicName}</span>
                        <span className={`text-sm font-medium ${
                          prereqAnalysis.averageScore >= 80 ? 'text-green-600' :
                          prereqAnalysis.averageScore >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}>{prereqAnalysis.averageScore}%</span>
                      </button>
                    );
                  })}
                </div>

                {/* Prerequisite Warning */}
                {selectedAnalysis.prerequisiteIds.some(pId => {
                  const pa = analysis.find(a => a.topicId === pId);
                  return pa && pa.averageScore < 70;
                }) && (
                  <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                      <span className="text-xs font-medium text-orange-800">Possible Prerequisite Issue</span>
                    </div>
                    <p className="text-xs text-orange-700">
                      Consider reviewing{' '}
                      {selectedAnalysis.prerequisiteIds
                        .filter(pId => {
                          const pa = analysis.find(a => a.topicId === pId);
                          return pa && pa.averageScore < 70;
                        })
                        .map(pId => analysis.find(a => a.topicId === pId)?.topicName)
                        .join(' and ')}{' '}
                      before moving deeper into {selectedAnalysis.topicName}.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Next Topics */}
            {selectedAnalysis.nextTopicIds.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-slate-700 mb-2">Leads To</h5>
                <div className="space-y-2">
                  {selectedAnalysis.nextTopicIds.map(nId => {
                    const nextAnalysis = analysis.find(a => a.topicId === nId);
                    if (!nextAnalysis) return null;
                    return (
                      <button
                        key={nId}
                        onClick={() => { setSelectedTopicId(nId); setSearchParams({ topic: nId }); }}
                        className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-left"
                      >
                        <span className="text-sm text-slate-700">{nextAnalysis.topicName}</span>
                        <span className={`text-sm font-medium ${
                          nextAnalysis.averageScore >= 80 ? 'text-green-600' :
                          nextAnalysis.averageScore >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}>{nextAnalysis.averageScore}%</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-medium text-indigo-800">Recommended Action</span>
              </div>
              <p className="text-xs text-indigo-700">
                {selectedAnalysis.status === 'Needs Attention'
                  ? `Review ${selectedAnalysis.topicName.toLowerCase()} with a short worked example, then give students 5 practice questions.`
                  : selectedAnalysis.status === 'Developing'
                  ? `Provide additional practice problems on ${selectedAnalysis.topicName.toLowerCase()} and check for understanding with quick formative assessment.`
                  : `${selectedAnalysis.topicName} is well understood. Consider introducing more challenging problems or moving to dependent topics.`
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DistributionBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-600 w-24">{label}</span>
      <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-700 w-6 text-right">{count}</span>
    </div>
  );
}
