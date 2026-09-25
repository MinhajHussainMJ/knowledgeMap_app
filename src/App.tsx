import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import { LoginPage, RegisterPage } from './pages/Auth';
import TeacherDashboard from './pages/TeacherDashboard';
import KnowledgeMap from './pages/KnowledgeMap';
import ClassManagement from './pages/ClassManagement';
import { AssessmentCreator, AssessmentList, StudentAssessmentList, TakeAssessment } from './pages/Assessments';
import { StudentDashboard, StudentKnowledgeMap } from './pages/StudentPages';
import { ClassInsights, LearningGroups } from './pages/InsightsAndGroups';
import { QuestionBank, TopicsList, ClassesList, CreateClass } from './pages/Management';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { currentUser } = useStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role && currentUser.role !== role) {
    return <Navigate to={currentUser.role === 'teacher' ? '/dashboard' : '/student/dashboard'} replace />;
  }
  return <Layout>{children}</Layout>;
}

function App() {
  const { currentUser } = useStore();

  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={currentUser ? <Navigate to={currentUser.role === 'teacher' ? '/dashboard' : '/student/dashboard'} /> : <LoginPage />} />
        <Route path="/register" element={currentUser ? <Navigate to={currentUser.role === 'teacher' ? '/dashboard' : '/student/dashboard'} /> : <RegisterPage />} />
        <Route path="/" element={<Navigate to={currentUser ? (currentUser.role === 'teacher' ? '/dashboard' : '/student/dashboard') : '/login'} />} />

        {/* Teacher Routes */}
        <Route path="/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/classes" element={<ProtectedRoute role="teacher"><ClassesList /></ProtectedRoute>} />
        <Route path="/classes/new" element={<ProtectedRoute role="teacher"><CreateClass /></ProtectedRoute>} />
        <Route path="/classes/:classId" element={<ProtectedRoute role="teacher"><ClassManagement /></ProtectedRoute>} />
        <Route path="/classes/:classId/knowledge-map" element={<ProtectedRoute role="teacher"><KnowledgeMap /></ProtectedRoute>} />
        <Route path="/classes/:classId/insights" element={<ProtectedRoute role="teacher"><ClassInsights /></ProtectedRoute>} />
        <Route path="/classes/:classId/groups" element={<ProtectedRoute role="teacher"><LearningGroups /></ProtectedRoute>} />
        <Route path="/assessments" element={<ProtectedRoute role="teacher"><AssessmentList /></ProtectedRoute>} />
        <Route path="/assessments/create" element={<ProtectedRoute role="teacher"><AssessmentCreator /></ProtectedRoute>} />
        <Route path="/question-bank" element={<ProtectedRoute role="teacher"><QuestionBank /></ProtectedRoute>} />
        <Route path="/topics" element={<ProtectedRoute role="teacher"><TopicsList /></ProtectedRoute>} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/assessments" element={<ProtectedRoute role="student"><StudentAssessmentList /></ProtectedRoute>} />
        <Route path="/student/knowledge-map" element={<ProtectedRoute role="student"><StudentKnowledgeMap /></ProtectedRoute>} />
        <Route path="/assessments/:assessmentId/take" element={<ProtectedRoute role="student"><TakeAssessment /></ProtectedRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
