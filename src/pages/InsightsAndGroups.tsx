import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  TrendingUp, TrendingDown, AlertTriangle, Lightbulb, ArrowRight,
  Users, Brain, BookOpen, Target, UserCheck, ChevronRight,
  BarChart3, Award, HelpCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';

export function ClassInsights() {
  const { classId } = useParams();
  const { getClassTopicAnalysis, getClassInsights, topics, getStudentsByClass, classes } = useStore();

  const cls = classes.find(c => c.id === classId);
  const analysis = getClassTopicAnalysis(classId || '');
  const insights = getClassInsights(classId || '');
  const students = getStudentsByClass(classId || '');

  const sortedByScore = [...analysis].sort((a, b) => b.averageScore - a.averageScore);

  // Radar chart data
  const radarData = analysis.map(a => ({
    topic: a.topicName.length > 12 ? a.topicName.substring(0, 12) + '...' : a.topicName,
    score: a.averageScore,
    fullMark: 100,
  }));

  // Distribution chart
  const distributionData = [
    { name: 'Strong', value: analysis.filter(a => a.status === 'Strong').length, fill: '#22c55e' },
    { name: 'Developing', value: analysis.filter(a => a.status === 'Developing').length, fill: '#f59e0b' },
    { name: 'Needs Attention', value: analysis.filter(a => a.status === 'Needs Attention').length, fill: '#ef4444' },
  ];

  // Students needing support
  const { attempts } = useStore();
  const classAttempts = attempts.filter(a => {
    const assessment = useStore.getState().assessments.find(ass => ass.id === a.assessmentId);
    return assessment?.classId === classId;
  });

  const studentsNeedingSupport = students.filter(student => {
    const studentAttempts = classAttempts.filter(a => a.studentId === student.id);
    return studentAttempts.some(a => a.topicScores.filter(ts => ts.status === 'Needs Attention').length >= 2);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Class Insights</h1>
          <p className="text-sm text-slate-500">{cls?.name}</p>
        </div>
        <Link to={`/classes/${classId}/knowledge-map`} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
          <Brain className="w-4 h-4" /> Knowledge Map
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-slate-500">Strongest Topic</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{insights.strongestTopic?.name || 'N/A'}</p>
          <p className="text-lg font-bold text-green-600">{insights.strongestTopic?.score || 0}%</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-slate-500">Needs Attention</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{insights.weakestTopic?.name || 'N/A'}</p>
          <p className="text-lg font-bold text-red-600">{insights.weakestTopic?.score || 0}%</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-medium text-slate-500">Students Needing Support</span>
          </div>
          <p className="text-lg font-bold text-slate-800">{insights.studentsNeedingSupport}</p>
          <p className="text-xs text-slate-500">of {students.length} students</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-slate-500">Prerequisite Issues</span>
          </div>
          <p className="text-lg font-bold text-slate-800">{insights.prerequisiteIssues.length}</p>
          <p className="text-xs text-slate-500">chains identified</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Topic Performance Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Class Average" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Topic Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Prerequisite Issues */}
      {insights.prerequisiteIssues.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Possible Prerequisite Issues
          </h3>
          <div className="space-y-4">
            {insights.prerequisiteIssues.map((issue, i) => (
              <div key={i} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {issue.chain.map((name, j) => (
                    <span key={j} className="flex items-center gap-1">
                      <span className="bg-white border border-orange-200 text-orange-700 px-2 py-1 rounded text-sm font-medium">{name}</span>
                      {j < issue.chain.length - 1 && <ArrowRight className="w-4 h-4 text-orange-400" />}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-orange-700">{issue.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic Rankings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">All Topics — Class Performance</h3>
        <div className="space-y-3">
          {sortedByScore.map((topic, i) => (
            <div key={topic.topicId} className="flex items-center gap-3">
              <span className="w-6 text-sm text-slate-400 text-center">{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">{topic.topicName}</span>
                  <span className="text-sm font-bold text-slate-800">{topic.averageScore}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      topic.status === 'Strong' ? 'bg-green-500' :
                      topic.status === 'Developing' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${topic.averageScore}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="text-green-600">Strong: {topic.strongCount}</span>
                  <span className="text-amber-600">Developing: {topic.developingCount}</span>
                  <span className="text-red-600">Attention: {topic.needsAttentionCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-indigo-800">Recommended Next Steps</h3>
        </div>
        <p className="text-sm text-indigo-700 mb-4">{insights.recommendation}</p>
        <div className="flex flex-wrap gap-2">
          <Link to={`/classes/${classId}/groups`} className="inline-flex items-center gap-1.5 bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-50">
            <Users className="w-4 h-4" /> Create Learning Groups
          </Link>
          <Link to={`/classes/${classId}/knowledge-map`} className="inline-flex items-center gap-1.5 bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-50">
            <Brain className="w-4 h-4" /> View Knowledge Map
          </Link>
        </div>
      </div>

      {/* Students Needing Support */}
      {studentsNeedingSupport.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-500" />
            Students Who May Benefit from Additional Support
          </h3>
          <p className="text-xs text-slate-500 mb-3">These students have multiple topics where they need attention. This information is private and for teacher use only.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {studentsNeedingSupport.map(student => {
              const studentAttempt = classAttempts.find(a => a.studentId === student.id);
              const weakTopics = studentAttempt?.topicScores.filter(ts => ts.status === 'Needs Attention') || [];
              return (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-amber-700">{student.name.charAt(0)}</span>
                    </div>
                    <span className="text-sm text-slate-700">{student.name}</span>
                  </div>
                  <span className="text-xs text-amber-600">{weakTopics.length} topics need review</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function LearningGroups() {
  const { classId } = useParams();
  const { getClassTopicAnalysis, topics, getStudentsByClass, attempts, assessments, classes } = useStore();
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  const cls = classes.find(c => c.id === classId);
  const analysis = getClassTopicAnalysis(classId || '');
  const classTopics = topics.filter(t => t.classId === classId);
  const students = getStudentsByClass(classId || '');

  const classAttempts = attempts.filter(a => {
    const assessment = assessments.find(ass => ass.id === a.assessmentId);
    return assessment?.classId === classId;
  });

  // Auto-select first topic using default value
  const effectiveSelectedTopic = selectedTopic || (classTopics.length > 0 ? classTopics[0].id : '');

  // Group students by performance on selected topic
  const groups = {
    advanced: [] as { student: any; score: number }[],
    practice: [] as { student: any; score: number }[],
    foundation: [] as { student: any; score: number }[],
  };

  students.forEach(student => {
    const studentAttempts = classAttempts.filter(a => a.studentId === student.id);
    let topicScore = 0;
    let count = 0;

    studentAttempts.forEach(attempt => {
      const ts = attempt.topicScores.find(t => t.topicId === effectiveSelectedTopic);
      if (ts) {
        topicScore += ts.score;
        count++;
      }
    });

    const avgScore = count > 0 ? Math.round(topicScore / count) : 0;

    if (avgScore >= 80) groups.advanced.push({ student, score: avgScore });
    else if (avgScore >= 60) groups.practice.push({ student, score: avgScore });
    else groups.foundation.push({ student, score: avgScore });
  });

  const selectedTopicName = classTopics.find(t => t.id === effectiveSelectedTopic)?.name || '';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Smart Learning Groups</h1>
        <p className="text-sm text-slate-500">{cls?.name} — Automatically generated based on topic performance</p>
      </div>

      {/* Topic Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select Topic for Grouping</label>
        <div className="flex flex-wrap gap-2">
          {classTopics.map(topic => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                effectiveSelectedTopic === topic.id
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {topic.name}
            </button>
          ))}
        </div>
      </div>

      {/* Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Advanced Group */}
        <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
          <div className="bg-green-50 px-4 py-3 border-b border-green-200">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Group A</h3>
                <p className="text-xs text-green-600">Ready for Advanced Work</p>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-1">{groups.advanced.length} students • Score ≥ 80%</p>
          </div>
          <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
            {groups.advanced.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No students in this group</p>
            ) : (
              groups.advanced.map(({ student, score }) => (
                <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-green-700">{student.name.charAt(0)}</span>
                    </div>
                    <span className="text-sm text-slate-700">{student.name}</span>
                  </div>
                  <span className="text-xs font-medium text-green-600">{score}%</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Practice Group */}
        <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="bg-amber-50 px-4 py-3 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-800">Group B</h3>
                <p className="text-xs text-amber-600">Needs Practice</p>
              </div>
            </div>
            <p className="text-xs text-amber-600 mt-1">{groups.practice.length} students • Score 60-79%</p>
          </div>
          <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
            {groups.practice.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No students in this group</p>
            ) : (
              groups.practice.map(({ student, score }) => (
                <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-amber-700">{student.name.charAt(0)}</span>
                    </div>
                    <span className="text-sm text-slate-700">{student.name}</span>
                  </div>
                  <span className="text-xs font-medium text-amber-600">{score}%</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Foundation Group */}
        <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-b border-red-200">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Group C</h3>
                <p className="text-xs text-red-600">Needs Foundation Review</p>
              </div>
            </div>
            <p className="text-xs text-red-600 mt-1">{groups.foundation.length} students • Score &lt; 60%</p>
          </div>
          <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
            {groups.foundation.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No students in this group</p>
            ) : (
              groups.foundation.map(({ student, score }) => (
                <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-red-700">{student.name.charAt(0)}</span>
                    </div>
                    <span className="text-sm text-slate-700">{student.name}</span>
                  </div>
                  <span className="text-xs font-medium text-red-600">{score}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="text-xs text-slate-500">
          <strong>Privacy Note:</strong> Learning groups are private teacher information. Students cannot see their group assignment or other students' performance data.
        </p>
      </div>
    </div>
  );
}
