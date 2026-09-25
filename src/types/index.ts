export type UserRole = 'teacher' | 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password: string;
  createdAt: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: string;
  subject: string;
  academicYear: string;
  description: string;
  joinCode: string;
  teacherId: string;
  archived: boolean;
  createdAt: string;
}

export interface ClassMember {
  id: string;
  classId: string;
  studentId: string;
  joinedAt: string;
}

export type TopicStatus = 'Strong' | 'Developing' | 'Needs Attention';

export interface Topic {
  id: string;
  name: string;
  description: string;
  subject: string;
  classId: string;
  difficulty: number;
  createdAt: string;
}

export interface TopicPrerequisite {
  id: string;
  topicId: string;
  prerequisiteId: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  topicId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  type: 'multiple-choice' | 'true-false';
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  classId: string;
  topicIds: string[];
  questionIds: string[];
  createdAt: string;
  dueDate?: string;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  studentId: string;
  answers: StudentAnswer[];
  totalScore: number;
  totalQuestions: number;
  topicScores: TopicScore[];
  completedAt: string;
  startedAt: string;
  completionTime: number;
}

export interface StudentAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  topicId: string;
}

export interface TopicScore {
  topicId: string;
  topicName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  status: TopicStatus;
}

export interface ClassTopicAnalysis {
  topicId: string;
  topicName: string;
  studentsAssessed: number;
  averageScore: number;
  strongCount: number;
  developingCount: number;
  needsAttentionCount: number;
  status: TopicStatus;
  prerequisiteIds: string[];
  nextTopicIds: string[];
}

export interface LearningGroup {
  id: string;
  classId: string;
  topicId: string;
  name: string;
  level: 'advanced' | 'practice' | 'foundation';
  studentIds: string[];
  createdAt: string;
}

export interface ClassInsight {
  strongestTopic: { name: string; score: number } | null;
  weakestTopic: { name: string; score: number } | null;
  topicNeedingSupport: { name: string; studentsCount: number } | null;
  prerequisiteIssues: { chain: string[]; description: string }[];
  studentsNeedingSupport: number;
  recommendation: string;
}
