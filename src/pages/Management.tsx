import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Plus, Search, Filter, BookOpen, Trash2, Edit2,
  CheckCircle2, X, Tag
} from 'lucide-react';

export function QuestionBank() {
  const { currentUser, classes, topics, questions, createQuestion, deleteTopic } = useStore();
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newQ, setNewQ] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    topicId: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    explanation: '',
  });

  const teacherClasses = classes.filter(c => c.teacherId === currentUser?.id);
  const classIds = teacherClasses.map(c => c.id);
  const classTopics = topics.filter(t => classIds.includes(t.classId));

  const filteredQuestions = questions.filter(q => {
    if (filterTopic && q.topicId !== filterTopic) return false;
    if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
    if (search && !q.questionText.toLowerCase().includes(search.toLowerCase())) return false;
    return classTopics.some(t => t.id === q.topicId);
  });

  const handleCreate = () => {
    if (!newQ.questionText || !newQ.topicId) return;
    createQuestion({
      ...newQ,
      type: 'multiple-choice',
    });
    setNewQ({ questionText: '', options: ['', '', '', ''], correctAnswer: 0, topicId: '', difficulty: 'medium', explanation: '' });
    setShowCreate(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Question Bank</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <select
            value={filterTopic}
            onChange={e => setFilterTopic(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="">All Topics</option>
            {classTopics.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <select
            value={filterDifficulty}
            onChange={e => setFilterDifficulty(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <p className="text-xs text-slate-500 mt-2">{filteredQuestions.length} questions</p>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-indigo-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">New Question</h3>
            <button onClick={() => setShowCreate(false)} className="p-1 rounded hover:bg-slate-100">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Question text"
            value={newQ.questionText}
            onChange={e => setNewQ({ ...newQ, questionText: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            {newQ.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="new-correct"
                  checked={newQ.correctAnswer === i}
                  onChange={() => setNewQ({ ...newQ, correctAnswer: i })}
                  className="text-indigo-600"
                />
                <input
                  type="text"
                  value={opt}
                  onChange={e => {
                    const opts = [...newQ.options];
                    opts[i] = e.target.value;
                    setNewQ({ ...newQ, options: opts });
                  }}
                  className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm"
                  placeholder={`Option ${i + 1}`}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={newQ.topicId}
              onChange={e => setNewQ({ ...newQ, topicId: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">Select Topic</option>
              {classTopics.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select
              value={newQ.difficulty}
              onChange={e => setNewQ({ ...newQ, difficulty: e.target.value as any })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Explanation (optional)"
            value={newQ.explanation}
            onChange={e => setNewQ({ ...newQ, explanation: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <button
            onClick={handleCreate}
            disabled={!newQ.questionText || !newQ.topicId}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            Add to Question Bank
          </button>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map(q => {
          const topic = classTopics.find(t => t.id === q.topicId);
          return (
            <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{q.questionText}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 bg-slate-100 rounded-full px-2 py-0.5 text-xs text-slate-600">
                      <Tag className="w-3 h-3" /> {topic?.name || 'Unknown'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>{q.difficulty}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {q.options.map((opt, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded ${
                        i === q.correctAnswer ? 'bg-green-50 text-green-700 font-medium' : 'text-slate-500'
                      }`}>
                        {i === q.correctAnswer && '✓ '}{opt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TopicsList() {
  const { currentUser, classes, topics, prerequisites, createTopic, deleteTopic, getClassTopicAnalysis } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const teacherClasses = classes.filter(c => c.teacherId === currentUser?.id);
  const classIds = teacherClasses.map(c => c.id);
  const classTopics = topics.filter(t => classIds.includes(t.classId));

  const effectiveSelectedClass = selectedClass || (teacherClasses.length > 0 ? teacherClasses[0].id : '');

  const filteredTopics = effectiveSelectedClass ? classTopics.filter(t => t.classId === effectiveSelectedClass) : classTopics;

  const handleCreate = () => {
    if (!newTopicName || !effectiveSelectedClass) return;
    createTopic({
      name: newTopicName,
      description: newTopicDesc || `Understanding ${newTopicName.toLowerCase()}`,
      subject: teacherClasses.find(c => c.id === effectiveSelectedClass)?.subject || '',
      classId: effectiveSelectedClass,
      difficulty: 3,
    });
    setNewTopicName('');
    setNewTopicDesc('');
    setShowCreate(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Topics</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> Add Topic
        </button>
      </div>

      {/* Class Filter */}
      <div className="flex gap-2 flex-wrap">
        {teacherClasses.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedClass(c.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              effectiveSelectedClass === c.id
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl border border-indigo-200 p-4 space-y-3">
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
            <button onClick={handleCreate} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700">Create</button>
            <button onClick={() => setShowCreate(false)} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-200">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredTopics.map(topic => {
          const prereqCount = prerequisites.filter(p => p.topicId === topic.id).length;
          const nextCount = prerequisites.filter(p => p.prerequisiteId === topic.id).length;
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
              <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                <span>{prereqCount} prerequisites</span>
                <span>{nextCount} leads to</span>
                <span>Difficulty: {topic.difficulty}/5</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ClassesList() {
  const { currentUser, classes, getStudentsByClass } = useStore();

  const teacherClasses = classes.filter(c => c.teacherId === currentUser?.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">My Classes</h1>
        <Link to="/classes/new" className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Create Class
        </Link>
      </div>

      {teacherClasses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No classes yet</p>
          <Link to="/classes/new" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">Create your first class</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teacherClasses.map(cls => {
            const students = getStudentsByClass(cls.id);
            return (
              <Link
                key={cls.id}
                to={`/classes/${cls.id}`}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <h3 className="font-semibold text-slate-800">{cls.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{cls.subject} • Grade {cls.grade}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span>{students.length} students</span>
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{cls.joinCode}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CreateClass() {
  const { createClass } = useStore();
  const [form, setForm] = useState({
    name: '',
    grade: '',
    subject: '',
    academicYear: '2024-2025',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.grade || !form.subject) return;
    createClass(form);
    window.history.back();
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Create New Class</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Class Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            placeholder="e.g., Class 9 Computer Science"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Grade</label>
            <input
              type="text"
              value={form.grade}
              onChange={e => setForm({ ...form, grade: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              placeholder="e.g., 9"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              placeholder="e.g., Computer Science"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
          <input
            type="text"
            value={form.academicYear}
            onChange={e => setForm({ ...form, academicYear: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            placeholder="e.g., 2024-2025"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            rows={3}
            placeholder="Brief description of this class..."
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            Create Class
          </button>
          <button type="button" onClick={() => window.history.back()} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
