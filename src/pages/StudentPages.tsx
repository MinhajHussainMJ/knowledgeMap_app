import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Brain, BookOpen, CheckCircle2, TrendingUp, TrendingDown, Clock,
  Users, Copy, Check, ArrowRight, Target, Lightbulb
} from 'lucide-react';
import {
  ReactFlow, Background, Controls, Node, Edge, Position, Handle, MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function StudentTopicNode({ data }: { data: any }) {
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
    <div className={`px-4 py-3 rounded-xl border-2 ${bgColor} shadow-sm min-w-[140px]`}>
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      <div className="text-center">
        <p className={`text-xs font-bold uppercase tracking-wide ${textColor}`}>{data.label}</p>
        <p className={`text-2xl font-bold mt-1 ${scoreColor}`}>{data.score}%</p>
        <p className={`text-xs font-medium mt-1 ${textColor}`}>{data.status}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = { studentTopicNode: StudentTopicNode };

export function StudentDashboard() {
  const { currentUser, classes, classMembers, assessments, attempts, getStudentTopicScores } = useStore();
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);
  const { joinClass } = useStore();

  const studentId = currentUser?.id || '';
  const myMemberships = classMembers.filter(m => m.studentId === studentId);
  const myClasses = classes.filter(c => myMemberships.some(m => m.classId === c.id));
  const myAttempts = attempts.filter(a => a.studentId === studentId);
  const myTopicScores = getStudentTopicScores(studentId);

  const strongTopics = myTopicScores.filter(t => t.status === 'Strong');
  const developingTopics = myTopicScores.filter(t => t.status === 'Developing');
  const attentionTopics = myTopicScores.filter(t => t.status === 'Needs Attention');

  const handleJoin = () => {
    setJoinError('');
    setJoinSuccess(false);
    if (!joinCode.trim()) {
      setJoinError('Please enter a class code');
      return;
    }
    const success = joinClass(joinCode.toUpperCase().trim(), studentId);
    if (success) {
      setJoinSuccess(true);
      setJoinCode('');
    } else {
      setJoinError('Invalid class code or you are already a member');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome, {currentUser?.name}</p>
      </div>

      {/* Join Class */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-3">Join a Class</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase"
            placeholder="Enter class code (e.g., CS9X42)"
            maxLength={6}
          />
          <button
            onClick={handleJoin}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Join
          </button>
        </div>
        {joinError && <p className="text-sm text-red-500 mt-2">{joinError}</p>}
        {joinSuccess && <p className="text-sm text-green-600 mt-2">Successfully joined the class!</p>}
      </div>

      {/* My Classes */}
      {myClasses.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-800">My Classes</h3>
          {myClasses.map(cls => (
            <div key={cls.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-800">{cls.name}</h4>
                  <p className="text-sm text-slate-500">{cls.subject} • {cls.grade}</p>
                </div>
                <Link to="/student/knowledge-map" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                  My Knowledge Map <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Knowledge Overview */}
      {myTopicScores.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">My Knowledge Overview</h3>
            <Link to="/student/knowledge-map" className="text-sm text-indigo-600 hover:underline">View Map →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {strongTopics.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Strong ({strongTopics.length})</span>
                </div>
                {strongTopics.map(t => (
                  <p key={t.topicId} className="text-xs text-green-700">{t.topicName} — {t.score}%</p>
                ))}
              </div>
            )}
            {developingTopics.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Developing ({developingTopics.length})</span>
                </div>
                {developingTopics.map(t => (
                  <p key={t.topicId} className="text-xs text-amber-700">{t.topicName} — {t.score}%</p>
                ))}
              </div>
            )}
            {attentionTopics.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Needs Review ({attentionTopics.length})</span>
                </div>
                {attentionTopics.map(t => (
                  <p key={t.topicId} className="text-xs text-red-700">{t.topicName} — {t.score}%</p>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Topics */}
          {attentionTopics.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-800">Recommended to Practice</span>
              </div>
              <p className="text-xs text-indigo-700">
                Focus on {attentionTopics.map(t => t.topicName).join(', ')} for improvement.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Assessments */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Recent Assessments</h3>
        {myAttempts.length === 0 ? (
          <p className="text-sm text-slate-500">No assessments completed yet.</p>
        ) : (
          <div className="space-y-2">
            {myAttempts.slice(0, 5).map(attempt => {
              const assessment = assessments.find(a => a.id === attempt.assessmentId);
              return (
                <div key={attempt.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{assessment?.title}</p>
                    <p className="text-xs text-slate-500">{new Date(attempt.completedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">{attempt.totalScore}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function StudentKnowledgeMap() {
  const { currentUser, topics, prerequisites, getStudentTopicScores, classMembers, classes } = useStore();
  const studentId = currentUser?.id || '';
  const myTopicScores = getStudentTopicScores(studentId);

  // Get the student's class topics
  const myMemberships = classMembers.filter(m => m.studentId === studentId);
  const myClassIds = myMemberships.map(m => m.classId);
  const classTopics = topics.filter(t => myClassIds.includes(t.classId));

  // Build flow nodes
  const topicMap = new Map(classTopics.map(t => [t.id, t]));
  const scoreMap = new Map(myTopicScores.map(s => [s.topicId, s]));

  const hasPrereqs = new Set(prerequisites.filter(p => topicMap.has(p.topicId)).map(p => p.topicId));
  const rootTopics = classTopics.filter(t => !hasPrereqs.has(t.id));

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
    const dependents = prerequisites.filter(p => p.prerequisiteId === id && topicMap.has(p.topicId));
    dependents.forEach(d => queue.push({ id: d.topicId, level: level + 1 }));
  }

  classTopics.forEach(t => { if (!levels.has(t.id)) levels.set(t.id, 0); });

  const levelGroups: Map<number, string[]> = new Map();
  levels.forEach((level, id) => {
    if (!levelGroups.has(level)) levelGroups.set(level, []);
    levelGroups.get(level)!.push(id);
  });

  const nodes: Node[] = [];
  levelGroups.forEach((ids, level) => {
    ids.forEach((id, index) => {
      const topic = topicMap.get(id);
      const score = scoreMap.get(id);
      if (!topic) return;

      const totalAtLevel = ids.length;
      const xOffset = (index - (totalAtLevel - 1) / 2) * 220;

      nodes.push({
        id: topic.id,
        type: 'studentTopicNode',
        position: { x: xOffset + 350, y: level * 170 + 50 },
        data: {
          label: topic.name,
          score: score?.score || 0,
          status: score?.status || 'Needs Attention',
        },
      });
    });
  });

  const edges: Edge[] = prerequisites
    .filter(p => topicMap.has(p.topicId) && topicMap.has(p.prerequisiteId))
    .map(p => ({
      id: `${p.prerequisiteId}-${p.topicId}`,
      source: p.prerequisiteId,
      target: p.topicId,
      type: 'smoothstep',
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    }));

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">My Knowledge Map</h1>
        <p className="text-sm text-slate-500">Your personal understanding across topics</p>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
        {nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Complete an assessment to see your knowledge map</p>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.3}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#e2e8f0" gap={20} />
            <Controls />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
