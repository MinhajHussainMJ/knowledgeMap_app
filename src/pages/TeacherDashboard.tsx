import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Users, BookOpen, Brain, AlertTriangle, TrendingUp, TrendingDown,
  Plus, ClipboardList, Eye, ArrowRight, CheckCircle2, Clock, AlertCircle,
  Lightbulb, ChevronRight
} from 'lucide-react';

export default function TeacherDashboard() {
  const { currentUser, classes, topics, attempts, assessments, getClassTopicAnalysis, getClassInsights, getStudentsByClass } = useStore();

  const teacherClasses = classes.filter(c => c.teacherId === currentUser?.id && !c.archived);
  const primaryClass = teacherClasses[0];

  if (!primaryClass) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Welcome!</h1>
        <p className="text-slate-600 mb-6">Get started by creating your first class.</p>
        <Link to="/classes/new" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Create Class
        </Link>
      </div>
    );
  }

  const classTopics = getClassTopicAnalysis(primaryClass.id);
  const insights = getClassInsights(primaryClass.id);
  const students = getStudentsByClass(primaryClass.id);
  const classAssessments = assessments.filter(a => a.classId === primaryClass.id);
  const classAttempts = attempts.filter(a => classAssessments.some(ass => ass.id === a.assessmentId));

  const strongTopics = classTopics.filter(t => t.status === 'Strong');
  const developingTopics = classTopics.filter(t => t.status === 'Developing');
  const attentionTopics = classTopics.filter(t => t.status === 'Needs Attention');

  const recentActivity = [
    { icon: CheckCircle2, text: `${classAttempts.length} students completed Diagnostic Test 1`, time: '2 days ago', color: 'text-green-500' },
    ...attentionTopics.slice(0, 1).map(t => ({
      icon: AlertTriangle,
      text: `${t.topicName} identified as needing attention (${t.averageScore}%)`,
      time: '2 days ago',
      color: 'text-red-500',
    })),
    { icon: Users, text: `${students.length} students in ${primaryClass.name}`, time: '1 week ago', color: 'text-blue-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Teacher Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {currentUser?.name}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/classes/new" className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Create Class
          </Link>
          <Link to="/assessments/create" className="inline-flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
            <ClipboardList className="w-4 h-4" /> Create Assessment
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={Users} label="Total Classes" value={teacherClasses.length} color="blue" />
        <SummaryCard icon={Users} label="Total Students" value={students.length} color="purple" />
        <SummaryCard icon={BookOpen} label="Assessments" value={classAssessments.length} color="green" />
        <SummaryCard icon={AlertTriangle} label="Topics Needing Attention" value={attentionTopics.length} color="red" />
      </div>

      {/* Class Pulse - Main Feature */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Class Pulse</h2>
          </div>
          <p className="text-indigo-100 text-sm mt-1">{primaryClass.name} — {students.length} students</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Topic Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strongTopics.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Strong</span>
                </div>
                {strongTopics.map(t => (
                  <div key={t.topicId} className="flex items-center justify-between py-1">
                    <span className="text-sm text-green-700">{t.topicName}</span>
                    <span className="text-sm font-medium text-green-800">{t.averageScore}%</span>
                  </div>
                ))}
              </div>
            )}

            {developingTopics.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Developing</span>
                </div>
                {developingTopics.map(t => (
                  <div key={t.topicId} className="flex items-center justify-between py-1">
                    <span className="text-sm text-amber-700">{t.topicName}</span>
                    <span className="text-sm font-medium text-amber-800">{t.averageScore}%</span>
                  </div>
                ))}
              </div>
            )}

            {attentionTopics.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Needs Attention</span>
                </div>
                {attentionTopics.map(t => (
                  <div key={t.topicId} className="flex items-center justify-between py-1">
                    <span className="text-sm text-red-700">{t.topicName}</span>
                    <span className="text-sm font-medium text-red-800">{t.averageScore}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prerequisite Issues */}
          {insights.prerequisiteIssues.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Possible Prerequisite Issues</span>
              </div>
              {insights.prerequisiteIssues.map((issue, i) => (
                <div key={i} className="mb-2 last:mb-0">
                  <div className="flex items-center gap-1 flex-wrap text-sm">
                    {issue.chain.map((name, j) => (
                      <span key={j} className="flex items-center gap-1">
                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium">{name}</span>
                        {j < issue.chain.length - 1 && <ArrowRight className="w-3 h-3 text-orange-400" />}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-orange-600 mt-1">{issue.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Recommendation */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-800">Recommended Next Lesson</span>
            </div>
            <p className="text-sm text-indigo-700">{insights.recommendation}</p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              {insights.studentsNeedingSupport} students may need additional support
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions & Knowledge Map Link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/classes/new" className="flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Plus className="w-6 h-6 text-indigo-600" />
              <span className="text-xs font-medium text-slate-700">Create Class</span>
            </Link>
            <Link to="/assessments/create" className="flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <ClipboardList className="w-6 h-6 text-indigo-600" />
              <span className="text-xs font-medium text-slate-700">Create Assessment</span>
            </Link>
            <Link to={`/classes/${primaryClass.id}/knowledge-map`} className="flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Brain className="w-6 h-6 text-indigo-600" />
              <span className="text-xs font-medium text-slate-700">View Knowledge Map</span>
            </Link>
            <Link to={`/classes/${primaryClass.id}`} className="flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Users className="w-6 h-6 text-indigo-600" />
              <span className="text-xs font-medium text-slate-700">Add Students</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <activity.icon className={`w-4 h-4 mt-0.5 ${activity.color}`} />
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{activity.text}</p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Class Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">{primaryClass.name} — Topic Overview</h3>
          <Link to={`/classes/${primaryClass.id}/knowledge-map`} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
            View Knowledge Map <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-2">
          {classTopics.map(topic => (
            <Link
              key={topic.topicId}
              to={`/classes/${primaryClass.id}/knowledge-map?topic=${topic.topicId}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <StatusBadge status={topic.status} />
                <span className="text-sm font-medium text-slate-700">{topic.topicName}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      topic.status === 'Strong' ? 'bg-green-500' :
                      topic.status === 'Developing' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${topic.averageScore}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-600 w-10 text-right">{topic.averageScore}%</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Strong': 'bg-green-100 text-green-700 border-green-200',
    'Developing': 'bg-amber-100 text-amber-700 border-amber-200',
    'Needs Attention': 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
}
