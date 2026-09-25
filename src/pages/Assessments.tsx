import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Plus, Trash2, ArrowLeft, Save, CheckCircle2,
  BookOpen, Clock, Users, AlertCircle
} from 'lucide-react';

export function AssessmentCreator() {
  const navigate = useNavigate();
  const { currentUser, classes, topics, questions, createAssessment, createQuestion } = useStore();
  const teacherClasses = classes.filter(c => c.teacherId === currentUser?.id && !c.archived);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClass, setSelectedClass] = useState(teacherClasses[0]?.id || '');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [step, setStep] = useState<'info' | 'questions'>('info');
  const [newQuestions, setNewQuestions] = useState<{
    questionText: string;
    options: string[];
    correctAnswer: number;
    topicId: string;
    difficulty: 'easy' | 'medium' | 'hard';
    explanation: string;
  }[]>([]);

  const classTopics = topics.filter(t => t.classId === selectedClass);

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const addQuestion = () => {
    setNewQuestions([...newQuestions, {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      topicId: selectedTopics[0] || '',
      difficulty: 'medium',
      explanation: '',
    }]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...newQuestions];
    (updated[index] as any)[field] = value;
    setNewQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setNewQuestions(newQuestions.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!title || !selectedClass || selectedTopics.length === 0) return;

    // Create new questions
    const createdQuestionIds: string[] = [];
    newQuestions.forEach(q => {
      const created = createQuestion({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        topicId: q.topicId,
        difficulty: q.difficulty,
        explanation: q.explanation,
        type: 'multiple-choice',
      });
      createdQuestionIds.push(created.id);
    });

    // Also include existing questions for selected topics
    const existingQuestionIds = questions
      .filter(q => selectedTopics.includes(q.topicId))
      .map(q => q.id);

    const allQuestionIds = [...new Set([...existingQuestionIds, ...createdQuestionIds])];

    createAssessment({
      title,
      description,
      classId: selectedClass,
      topicIds: selectedTopics,
      questionIds: allQuestionIds,
    });

    navigate('/assessments');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/assessments')} className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Create Assessment</h1>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        <button onClick={() => setStep('info')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${step === 'info' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}>
          1. Assessment Info
        </button>
        <span className="text-slate-300">→</span>
        <button onClick={() => setStep('questions')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${step === 'questions' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}>
          2. Add Questions
        </button>
      </div>

      {step === 'info' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              placeholder="e.g., Diagnostic Test 1 — Core Concepts"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              rows={2}
              placeholder="Brief description of this assessment..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={e => { setSelectedClass(e.target.value); setSelectedTopics([]); }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {teacherClasses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Topics</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {classTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={`p-2 rounded-lg border text-sm text-left transition-colors ${
                    selectedTopics.includes(topic.id)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {selectedTopics.includes(topic.id) && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                  {topic.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep('questions')}
            disabled={!title || !selectedClass || selectedTopics.length === 0}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Add Questions →
          </button>
        </div>
      )}

      {step === 'questions' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> This assessment will automatically include all existing questions for the selected topics from the Question Bank. You can also add new custom questions below.
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Existing questions for selected topics: {questions.filter(q => selectedTopics.includes(q.topicId)).length}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Custom Questions ({newQuestions.length})</h3>
            <button onClick={addQuestion} className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          {newQuestions.map((q, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Question {i + 1}</span>
                <button onClick={() => removeQuestion(i)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={q.questionText}
                onChange={e => updateQuestion(i, 'questionText', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Question text"
              />
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${i}`}
                      checked={q.correctAnswer === j}
                      onChange={() => updateQuestion(i, 'correctAnswer', j)}
                      className="text-indigo-600"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const newOpts = [...q.options];
                        newOpts[j] = e.target.value;
                        updateQuestion(i, 'options', newOpts);
                      }}
                      className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm"
                      placeholder={`Option ${j + 1}`}
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={q.topicId}
                  onChange={e => updateQuestion(i, 'topicId', e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  {selectedTopics.map(tid => {
                    const t = classTopics.find(ct => ct.id === tid);
                    return <option key={tid} value={tid}>{t?.name}</option>;
                  })}
                </select>
                <select
                  value={q.difficulty}
                  onChange={e => updateQuestion(i, 'difficulty', e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <input
                type="text"
                value={q.explanation}
                onChange={e => updateQuestion(i, 'explanation', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Explanation (optional)"
              />
            </div>
          ))}

          <div className="flex gap-3">
            <button onClick={() => setStep('info')} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">
              ← Back
            </button>
            <button
              onClick={handleCreate}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Create Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AssessmentList() {
  const { currentUser, classes, assessments, attempts } = useStore();
  const teacherClasses = classes.filter(c => c.teacherId === currentUser?.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Assessments</h1>
        <Link to="/assessments/create" className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Create Assessment
        </Link>
      </div>

      {assessments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No assessments yet</p>
          <Link to="/assessments/create" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">Create your first assessment</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.map(assessment => {
            const cls = teacherClasses.find(c => c.id === assessment.classId);
            const classAttempts = attempts.filter(a => a.assessmentId === assessment.id);
            return (
              <div key={assessment.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-slate-800">{assessment.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{assessment.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cls?.name}</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {classAttempts.length} completed</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {assessment.questionIds.length} questions</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function StudentAssessmentList() {
  const { currentUser, classes, classMembers, assessments, attempts } = useStore();
  const studentId = currentUser?.id || '';

  const myMemberships = classMembers.filter(m => m.studentId === studentId);
  const myClassIds = myMemberships.map(m => m.classId);
  const myAssessments = assessments.filter(a => myClassIds.includes(a.classId));
  const myAttempts = attempts.filter(a => a.studentId === studentId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">My Assessments</h1>

      {myAssessments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No assessments assigned yet</p>
          <p className="text-sm text-slate-400 mt-1">Join a class to see assigned assessments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myAssessments.map(assessment => {
            const attempt = myAttempts.find(a => a.assessmentId === assessment.id);
            const cls = classes.find(c => c.id === assessment.classId);
            return (
              <div key={assessment.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-800">{assessment.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{cls?.name} • {assessment.questionIds.length} questions</p>
                  </div>
                  {attempt ? (
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">{attempt.totalScore}%</p>
                      <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</p>
                    </div>
                  ) : (
                    <Link
                      to={`/assessments/${assessment.id}/take`}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                    >
                      Start Assessment
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TakeAssessment() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { currentUser, assessments, questions, submitAssessment } = useStore();

  const assessment = assessments.find(a => a.id === assessmentId);
  const assessmentQuestions = questions.filter(q => assessment?.questionIds.includes(q.id));

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(Date.now());

  if (!assessment) return <div className="text-center py-12 text-slate-500">Assessment not found</div>;

  if (submitted) {
    const attempt = useStore.getState().attempts.find(
      a => a.assessmentId === assessmentId && a.studentId === currentUser?.id
    );
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Assessment Submitted!</h2>
        {attempt && (
          <div className="space-y-2 mb-6">
            <p className="text-lg text-slate-600">Your Score: <span className="font-bold text-indigo-600">{attempt.totalScore}%</span></p>
            <p className="text-sm text-slate-500">{attempt.topicScores.filter(t => t.status === 'Strong').length} topics Strong, {attempt.topicScores.filter(t => t.status === 'Developing').length} Developing, {attempt.topicScores.filter(t => t.status === 'Needs Attention').length} Needing Attention</p>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/student/assessments')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            Back to Assessments
          </button>
          <button onClick={() => navigate('/student/knowledge-map')} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
            View Knowledge Map
          </button>
        </div>
      </div>
    );
  }

  const question = assessmentQuestions[currentQ];
  if (!question) return <div className="text-center py-12 text-slate-500">No questions available</div>;

  const handleSubmit = () => {
    const studentAnswers = assessmentQuestions.map(q => ({
      questionId: q.id,
      selectedAnswer: answers[q.id] ?? -1,
      isCorrect: answers[q.id] === q.correctAnswer,
      topicId: q.topicId,
    }));

    const topicMap: Record<string, { correct: number; total: number; name: string }> = {};
    studentAnswers.forEach(a => {
      const q = assessmentQuestions.find(qq => qq.id === a.questionId);
      if (!topicMap[a.topicId]) topicMap[a.topicId] = { correct: 0, total: 0, name: q?.topicId || '' };
      topicMap[a.topicId].total++;
      if (a.isCorrect) topicMap[a.topicId].correct++;
    });

    const topicScores = Object.entries(topicMap).map(([topicId, data]) => {
      const topic = questions.find(q => q.topicId === topicId);
      const score = Math.round((data.correct / data.total) * 100);
      return {
        topicId,
        topicName: topic?.topicId || topicId,
        score,
        totalQuestions: data.total,
        correctAnswers: data.correct,
        status: (score >= 80 ? 'Strong' : score >= 60 ? 'Developing' : 'Needs Attention') as any,
      };
    });

    // Get topic names from store
    const storeTopics = useStore.getState().topics;
    topicScores.forEach(ts => {
      const topic = storeTopics.find(t => t.id === ts.topicId);
      if (topic) ts.topicName = topic.name;
    });

    const totalCorrect = studentAnswers.filter(a => a.isCorrect).length;

    submitAssessment({
      assessmentId: assessment.id,
      studentId: currentUser!.id,
      answers: studentAnswers,
      totalScore: Math.round((totalCorrect / assessmentQuestions.length) * 100),
      totalQuestions: assessmentQuestions.length,
      topicScores,
      startedAt: new Date(startTime).toISOString(),
      completionTime: Math.round((Date.now() - startTime) / 1000),
    });

    setSubmitted(true);
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">{assessment.title}</h2>
            <p className="text-sm text-slate-500">Question {currentQ + 1} of {assessmentQuestions.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">{answeredCount}/{assessmentQuestions.length} answered</p>
            <div className="w-32 h-2 bg-slate-100 rounded-full mt-1">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(answeredCount / assessmentQuestions.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      {!showConfirm ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-lg font-medium text-slate-800 mb-6">{question.questionText}</p>

          <div className="space-y-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => setAnswers({ ...answers, [question.id]: i })}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  answers[question.id] === i
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                {option}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
            >
              Previous
            </button>

            {currentQ === assessmentQuestions.length - 1 ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
              >
                Submit Assessment
              </button>
            ) : (
              <button
                onClick={() => setCurrentQ(Math.min(assessmentQuestions.length - 1, currentQ + 1))}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Confirmation Dialog */
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Submit Assessment?</h3>
          <p className="text-sm text-slate-500 mb-2">
            You have answered {answeredCount} of {assessmentQuestions.length} questions.
          </p>
          {answeredCount < assessmentQuestions.length && (
            <p className="text-sm text-amber-600 mb-4">
              {assessmentQuestions.length - answeredCount} questions are unanswered and will be marked incorrect.
            </p>
          )}
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              Go Back
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
            >
              Confirm Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
