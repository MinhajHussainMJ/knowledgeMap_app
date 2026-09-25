import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Plus, Users, BookOpen, Brain, Settings, Copy, Check,
  Trash2, Edit2, ArrowLeft, UserMinus, Search, Filter,
  ChevronRight, Layers, Link2
} from 'lucide-react';

export default function ClassManagement() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { classes, currentUser, topics, prerequisites, getStudentsByClass, getClassTopicAnalysis, removeStudentFromClass, createTopic, deleteTopic, addPrerequisite, removePrerequisite, updateTopic } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'topics' | 'prerequisites'>('overview');
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [editingPrereq, setEditingPrereq] = useState<string | null>(null);

  const cls = classes.find(c => c.id === classId);
  if (!cls) return <div className="text-center py-12 text-slate-500">Class not found</div>;

  const students = getStudentsByClass(cls.id);
  const classTopics = topics.filter(t => t.classId === cls.id);
  const classAnalysis = getClassTopicAnalysis(cls.id);
  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const copyCode = () => {
    navigator.clipboard.writeText(cls.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateTopic = () => {
    if (!newTopicName.trim()) return;
    createTopic({
      name: newTopicName,
      description: newTopicDesc || `Understanding ${newTopicName.toLowerCase()}`,
      subject: cls.subject,
      classId: cls.id,
      difficulty: 3,
    });
    setNewTopicName('');
    setNewTopicDesc('');
    setShowNewTopic(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{cls.name}</h1>
          <p className="text-sm text-slate-500">{cls.subject} • Grade {cls.grade} • {cls.academicYear}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="text-sm font-mono font-bold text-slate-700">{cls.joinCode}</span>
            <button onClick={copyCode} className="p-1 rounded hover:bg-slate-200" title="Copy join code">
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: Brain },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'topics', label: 'Topics', icon: Layers },
          { id: 'prerequisites', label: 'Prerequisites', icon: Link2 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Students</p>
              <p className="text-2xl font-bold text-slate-800">{students.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Topics</p>
              <p className="text-2xl font-bold text-slate-800">{classTopics.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Prerequisite Links</p>
              <p className="text-2xl font-bold text-slate-800">{prerequisites.filter(p => classTopics.some(t => t.id === p.topicId)).length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Topic Performance</h3>
              <Link to={`/classes/${cls.id}/knowledge-map`} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                Open Knowledge Map <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {classAnalysis.map(a => (
                <div key={a.topicId} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    a.status === 'Strong' ? 'bg-green-500' : a.status === 'Developing' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-slate-700 flex-1">{a.topicName}</span>
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      a.status === 'Strong' ? 'bg-green-500' : a.status === 'Developing' ? 'bg-amber-500' : 'bg-red-500'
                    }`} style={{ width: `${a.averageScore}%` }} />
                  </div>
                  <span className="text-sm font-medium text-slate-600 w-10 text-right">{a.averageScore}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to={`/classes/${cls.id}/knowledge-map`} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 transition-colors">
              <Brain className="w-6 h-6 text-indigo-600 mb-2" />
              <h4 className="font-medium text-slate-800">Knowledge Map</h4>
              <p className="text-sm text-slate-500">Visualize class understanding</p>
            </Link>
            <Link to={`/classes/${cls.id}/insights`} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 transition-colors">
              <BookOpen className="w-6 h-6 text-indigo-600 mb-2" />
              <h4 className="font-medium text-slate-800">Class Insights</h4>
              <p className="text-sm text-slate-500">View detailed analysis</p>
            </Link>
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <p className="text-sm text-slate-500">{filteredStudents.length} students</p>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredStudents.map(student => (
              <div key={student.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-700">{student.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{student.name}</p>
                    <p className="text-xs text-slate-500">{student.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeStudentFromClass(cls.id, student.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                  title="Remove student"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topics Tab */}
      {activeTab === 'topics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Topics ({classTopics.length})</h3>
            <button
              onClick={() => setShowNewTopic(true)}
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Add Topic
            </button>
          </div>

          {showNewTopic && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <input
                type="text"
                placeholder="Topic name"
                value={newTopicName}
                onChange={e => setNewTopicName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newTopicDesc}
                onChange={e => setNewTopicDesc(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <button onClick={handleCreateTopic} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700">Create</button>
                <button onClick={() => setShowNewTopic(false)} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-200">Cancel</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {classTopics.map(topic => {
              const topicAnalysis = classAnalysis.find(a => a.topicId === topic.id);
              return (
                <div key={topic.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-slate-800">{topic.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{topic.description}</p>
                    </div>
                    <button
                      onClick={() => deleteTopic(topic.id)}
                      className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {topicAnalysis && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        topicAnalysis.status === 'Strong' ? 'bg-green-100 text-green-700' :
                        topicAnalysis.status === 'Developing' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>{topicAnalysis.status}</span>
                      <span className="text-xs text-slate-500">{topicAnalysis.averageScore}% avg</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Prerequisites Tab */}
      {activeTab === 'prerequisites' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Define prerequisite relationships between topics. This helps identify possible learning gaps when students struggle with dependent topics.
          </p>

          <div className="space-y-3">
            {classTopics.map(topic => {
              const topicPrereqs = prerequisites.filter(p => p.topicId === topic.id);
              const availablePrereqs = classTopics.filter(t =>
                t.id !== topic.id && !topicPrereqs.some(p => p.prerequisiteId === t.id)
              );

              return (
                <div key={topic.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-800">{topic.name}</h4>
                    <button
                      onClick={() => setEditingPrereq(editingPrereq === topic.id ? null : topic.id)}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      {editingPrereq === topic.id ? 'Done' : 'Edit'}
                    </button>
                  </div>

                  {topicPrereqs.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {topicPrereqs.map(p => {
                        const prereqTopic = classTopics.find(t => t.id === p.prerequisiteId);
                        if (!prereqTopic) return null;
                        return (
                          <span key={p.id} className="inline-flex items-center gap-1 bg-slate-100 rounded-full px-2.5 py-1 text-xs font-medium text-slate-700">
                            {prereqTopic.name}
                            {editingPrereq === topic.id && (
                              <button onClick={() => removePrerequisite(topic.id, p.prerequisiteId)} className="ml-1 text-slate-400 hover:text-red-500">×</button>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mb-2">No prerequisites defined</p>
                  )}

                  {editingPrereq === topic.id && availablePrereqs.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Add prerequisite:</p>
                      <div className="flex flex-wrap gap-1">
                        {availablePrereqs.map(t => (
                          <button
                            key={t.id}
                            onClick={() => addPrerequisite(topic.id, t.id)}
                            className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100"
                          >
                            + {t.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
