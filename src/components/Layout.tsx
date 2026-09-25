import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  LayoutDashboard, Users, BookOpen, Brain, BarChart3,
  UserCheck, LogOut, Menu, X, GraduationCap, ClipboardList,
  Layers, Settings
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { currentUser, sidebarOpen, setSidebarOpen, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const teacherNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/classes', icon: Users, label: 'Classes' },
    { path: '/assessments', icon: ClipboardList, label: 'Assessments' },
    { path: '/question-bank', icon: BookOpen, label: 'Question Bank' },
    { path: '/topics', icon: Layers, label: 'Topics' },
  ];

  const studentNavItems = [
    { path: '/student/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
    { path: '/student/assessments', icon: ClipboardList, label: 'My Assessments' },
    { path: '/student/knowledge-map', icon: Brain, label: 'My Knowledge Map' },
  ];

  const navItems = currentUser?.role === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
            <Brain className="w-7 h-7 text-indigo-600" />
            <span className="font-bold text-lg text-slate-800">Knowledge Map</span>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="font-medium text-sm text-slate-800 truncate">{currentUser?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{currentUser?.role}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map(item => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-3 py-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-600 hidden sm:block">
              {currentUser?.role === 'teacher' ? 'Teacher Portal' : 'Student Portal'}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
