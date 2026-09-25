import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, ClassRoom, ClassMember, Topic, TopicPrerequisite, Question, Assessment, AssessmentAttempt, ClassTopicAnalysis, ClassInsight, TopicScore, TopicStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

function getStatus(score: number): TopicStatus {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Developing';
  return 'Needs Attention';
}

function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// Generate 30 students
const studentNames = [
  'Emma Wilson', 'Liam Chen', 'Sophia Patel', 'Noah Kim', 'Olivia Brown',
  'Jackson Davis', 'Ava Martinez', 'Lucas Taylor', 'Mia Johnson', 'Ethan White',
  'Isabella Garcia', 'Mason Lee', 'Charlotte Anderson', 'Aiden Thomas', 'Amelia Jackson',
  'Logan Harris', 'Harper Clark', 'Jacob Lewis', 'Evelyn Robinson', 'Daniel Walker',
  'Abigail Hall', 'James Young', 'Emily King', 'Benjamin Wright', 'Elizabeth Scott',
  'Alexander Green', 'Sofia Adams', 'William Baker', 'Aria Nelson', 'Michael Hill'
];

const topicNames = [
  'Computer Fundamentals', 'Number Systems', 'Boolean Logic', 'Algorithms',
  'Flowcharts', 'Variables', 'Conditions', 'Loops', 'Functions', 'Data Structures'
];

// Create topics
const topics: Topic[] = topicNames.map((name, i) => ({
  id: `topic-${i + 1}`,
  name,
  description: `Understanding ${name.toLowerCase()} in Computer Science`,
  subject: 'Computer Science',
  classId: 'class-1',
  difficulty: Math.min(i + 1, 5),
  createdAt: '2024-01-15T10:00:00Z',
}));

// Prerequisites: Boolean Logic → Conditions → Loops → Functions
// Also: Variables → Conditions → Loops
const prerequisites: TopicPrerequisite[] = [
  { id: 'prereq-1', topicId: 'topic-3', prerequisiteId: 'topic-2' }, // Boolean Logic ← Number Systems
  { id: 'prereq-2', topicId: 'topic-7', prerequisiteId: 'topic-3' }, // Conditions ← Boolean Logic
  { id: 'prereq-3', topicId: 'topic-7', prerequisiteId: 'topic-6' }, // Conditions ← Variables
  { id: 'prereq-4', topicId: 'topic-8', prerequisiteId: 'topic-7' }, // Loops ← Conditions
  { id: 'prereq-5', topicId: 'topic-9', prerequisiteId: 'topic-8' }, // Functions ← Loops
  { id: 'prereq-6', topicId: 'topic-4', prerequisiteId: 'topic-5' }, // Algorithms ← Flowcharts
  { id: 'prereq-7', topicId: 'topic-10', prerequisiteId: 'topic-9' }, // Data Structures ← Functions
];

// Create questions for each topic (3 questions per topic = 30 questions)
const questions: Question[] = [];
const questionTemplates: Record<string, { text: string; options: string[]; correct: number; explanation: string }[]> = {
  'topic-1': [
    { text: 'What is the primary function of a CPU?', options: ['Store data permanently', 'Process instructions and data', 'Display graphics', 'Connect to the internet'], correct: 1, explanation: 'The CPU (Central Processing Unit) is the brain of the computer that processes instructions.' },
    { text: 'Which of these is an input device?', options: ['Monitor', 'Printer', 'Keyboard', 'Speaker'], correct: 2, explanation: 'A keyboard is an input device that allows users to enter data into a computer.' },
    { text: 'What does RAM stand for?', options: ['Read Access Memory', 'Random Access Memory', 'Run Application Memory', 'Rapid Access Module'], correct: 1, explanation: 'RAM stands for Random Access Memory - it is volatile memory used for temporary data storage.' },
  ],
  'topic-2': [
    { text: 'What is the binary representation of the decimal number 5?', options: ['101', '110', '100', '111'], correct: 0, explanation: '5 in binary is 101 (4 + 0 + 1 = 5).' },
    { text: 'Convert binary 1100 to decimal:', options: ['10', '12', '14', '8'], correct: 1, explanation: '1100 in binary = 8 + 4 + 0 + 0 = 12.' },
    { text: 'What base does the hexadecimal system use?', options: ['Base 2', 'Base 8', 'Base 10', 'Base 16'], correct: 3, explanation: 'Hexadecimal is a base-16 number system using digits 0-9 and letters A-F.' },
  ],
  'topic-3': [
    { text: 'What is the result of TRUE AND FALSE?', options: ['TRUE', 'FALSE', 'ERROR', 'NULL'], correct: 1, explanation: 'AND returns TRUE only when both operands are TRUE.' },
    { text: 'What is the result of NOT TRUE?', options: ['TRUE', 'FALSE', 'NOT', '1'], correct: 1, explanation: 'NOT inverts the boolean value, so NOT TRUE = FALSE.' },
    { text: 'What is TRUE OR FALSE?', options: ['TRUE', 'FALSE', 'MAYBE', 'ERROR'], correct: 0, explanation: 'OR returns TRUE when at least one operand is TRUE.' },
  ],
  'topic-4': [
    { text: 'Which sorting algorithm has the best average-case time complexity?', options: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'], correct: 2, explanation: 'Merge Sort has O(n log n) average-case time complexity.' },
    { text: 'What is a linear search?', options: ['Search that checks every element in order', 'Search that divides the list in half', 'Search using a hash table', 'Search using a tree'], correct: 0, explanation: 'Linear search checks each element sequentially from start to end.' },
    { text: 'Binary search requires the data to be:', options: ['Sorted', 'Numerical', 'Short', 'Unique'], correct: 0, explanation: 'Binary search requires data to be sorted to efficiently divide and search.' },
  ],
  'topic-5': [
    { text: 'What shape represents a decision in a flowchart?', options: ['Rectangle', 'Diamond', 'Circle', 'Oval'], correct: 1, explanation: 'A diamond shape represents a decision point in a flowchart.' },
    { text: 'What does an oval shape represent in a flowchart?', options: ['Process', 'Decision', 'Start/End', 'Input/Output'], correct: 2, explanation: 'Oval shapes represent the start and end points of a flowchart.' },
    { text: 'Arrows in a flowchart show:', options: ['Data storage', 'Flow direction', 'Error handling', 'Variable assignment'], correct: 1, explanation: 'Arrows indicate the direction of flow between different steps.' },
  ],
  'topic-6': [
    { text: 'What is a variable in programming?', options: ['A fixed value', 'A named storage location', 'A type of loop', 'A function name'], correct: 1, explanation: 'A variable is a named storage location in memory that holds a value.' },
    { text: 'What is the value of x after: x = 5; x = x + 3?', options: ['5', '3', '8', 'Error'], correct: 2, explanation: 'x starts at 5, then x + 3 = 8 is assigned back to x.' },
    { text: 'Which is a valid variable name?', options: ['2ndPlace', 'my-var', 'myVar', 'class'], correct: 2, explanation: 'myVar follows naming conventions: starts with letter, uses camelCase.' },
  ],
  'topic-7': [
    { text: 'What will this code output? if (5 > 3) { print("Yes") } else { print("No") }', options: ['Yes', 'No', 'Error', 'Nothing'], correct: 0, explanation: '5 > 3 is true, so the if branch executes and prints "Yes".' },
    { text: 'What does an else statement do?', options: ['Always executes', 'Executes when if condition is false', 'Creates a loop', 'Defines a variable'], correct: 1, explanation: 'The else block executes when the if condition evaluates to false.' },
    { text: 'What is the result of: if (10 == 10) { true } else { false }?', options: ['true', 'false', 'Error', '10'], correct: 0, explanation: '10 == 10 is true, so the condition is met and true is returned.' },
  ],
  'topic-8': [
    { text: 'How many times will this loop run? for (i = 0; i < 5; i++) { }', options: ['4', '5', '6', 'Infinite'], correct: 1, explanation: 'The loop runs for i = 0, 1, 2, 3, 4 — that is 5 iterations.' },
    { text: 'What is the difference between while and do-while?', options: ['No difference', 'do-while always runs at least once', 'while is faster', 'do-while cannot have conditions'], correct: 1, explanation: 'A do-while loop checks the condition after executing, so it always runs at least once.' },
    { text: 'What causes an infinite loop?', options: ['Using too many variables', 'Condition never becomes false', 'Using break statement', 'Having too many iterations'], correct: 1, explanation: 'An infinite loop occurs when the loop condition never evaluates to false.' },
  ],
  'topic-9': [
    { text: 'What is a function in programming?', options: ['A type of variable', 'A reusable block of code', 'A loop structure', 'A data type'], correct: 1, explanation: 'A function is a reusable block of code that performs a specific task.' },
    { text: 'What does a return statement do?', options: ['Starts a function', 'Sends a value back from a function', 'Creates a loop', 'Defines a parameter'], correct: 1, explanation: 'A return statement sends a value back to where the function was called.' },
    { text: 'What are parameters in a function?', options: ['The function name', 'Values passed into a function', 'The return value', 'The loop counter'], correct: 1, explanation: 'Parameters are values that are passed into a function when it is called.' },
  ],
  'topic-10': [
    { text: 'Which data structure uses FIFO (First In, First Out)?', options: ['Stack', 'Queue', 'Tree', 'Graph'], correct: 1, explanation: 'A Queue follows FIFO - the first element added is the first one removed.' },
    { text: 'What is an array?', options: ['A single variable', 'A collection of elements at contiguous memory locations', 'A type of function', 'A loop structure'], correct: 1, explanation: 'An array is a data structure that stores elements in contiguous memory locations.' },
    { text: 'What is the time complexity of accessing an array element by index?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correct: 2, explanation: 'Array access by index is O(1) - constant time, as elements are at known positions.' },
  ],
};

// Generate questions
Object.entries(questionTemplates).forEach(([topicId, qs]) => {
  qs.forEach((q, i) => {
    questions.push({
      id: `q-${topicId}-${i + 1}`,
      questionText: q.text,
      options: q.options,
      correctAnswer: q.correct,
      topicId,
      difficulty: i === 0 ? 'easy' : i === 1 ? 'medium' : 'hard',
      explanation: q.explanation,
      type: 'multiple-choice',
    });
  });
});

// Create students
const students: User[] = studentNames.map((name, i) => ({
  id: `student-${i + 1}`,
  email: `student${i + 1}@school.edu`,
  name,
  role: 'student' as const,
  password: 'DemoStudent123!',
  createdAt: '2024-01-10T10:00:00Z',
}));

// Create class members
const classMembers: ClassMember[] = students.map((s, i) => ({
  id: `member-${i + 1}`,
  classId: 'class-1',
  studentId: s.id,
  joinedAt: '2024-01-12T10:00:00Z',
}));

// Create realistic topic scores for each student
// Pattern: Computer Fundamentals ~88%, Number Systems ~82%, Boolean Logic ~54%,
// Conditions ~61%, Loops ~48%, Functions ~72%, others varying
function generateStudentTopicScores(studentIndex: number): Record<string, number> {
  const baseScores: Record<string, number> = {
    'topic-1': 88, // Computer Fundamentals
    'topic-2': 82, // Number Systems
    'topic-3': 54, // Boolean Logic
    'topic-4': 65, // Algorithms
    'topic-5': 70, // Flowcharts
    'topic-6': 75, // Variables
    'topic-7': 61, // Conditions
    'topic-8': 48, // Loops
    'topic-9': 72, // Functions
    'topic-10': 60, // Data Structures
  };

  const scores: Record<string, number> = {};
  Object.entries(baseScores).forEach(([topicId, base]) => {
    // Add variance per student (±20 points)
    const variance = Math.sin(studentIndex * 7 + parseInt(topicId.split('-')[1]) * 13) * 20;
    const score = Math.max(0, Math.min(100, Math.round(base + variance)));
    scores[topicId] = score;
  });
  return scores;
}

// Create assessment
const assessment: Assessment = {
  id: 'assessment-1',
  title: 'Diagnostic Test 1 — Core Concepts',
  description: 'A diagnostic assessment covering fundamental Computer Science concepts to identify class knowledge patterns.',
  classId: 'class-1',
  topicIds: topics.map(t => t.id),
  questionIds: questions.map(q => q.id),
  createdAt: '2024-02-01T10:00:00Z',
  dueDate: '2024-02-15T23:59:00Z',
};

// Generate assessment attempts for all students
const attempts: AssessmentAttempt[] = students.map((student, si) => {
  const topicScoresMap = generateStudentTopicScores(si);
  const answers: { questionId: string; selectedAnswer: number; isCorrect: boolean; topicId: string }[] = [];
  const topicScores: TopicScore[] = [];

  questions.forEach(q => {
    const topicScore = topicScoresMap[q.topicId] || 50;
    // Simulate whether student gets this question right based on their topic score
    const threshold = 100 - topicScore;
    const randomVal = Math.abs(Math.sin(si * 17 + parseInt(q.id.split('-')[2]) * 31)) * 100;
    const isCorrect = randomVal > threshold;
    const selectedAnswer = isCorrect ? q.correctAnswer : (q.correctAnswer + 1) % q.options.length;

    answers.push({
      questionId: q.id,
      selectedAnswer,
      isCorrect,
      topicId: q.topicId,
    });
  });

  // Calculate topic scores
  const topicQuestionMap: Record<string, { correct: number; total: number }> = {};
  answers.forEach(a => {
    if (!topicQuestionMap[a.topicId]) topicQuestionMap[a.topicId] = { correct: 0, total: 0 };
    topicQuestionMap[a.topicId].total++;
    if (a.isCorrect) topicQuestionMap[a.topicId].correct++;
  });

  Object.entries(topicQuestionMap).forEach(([topicId, data]) => {
    const topic = topics.find(t => t.id === topicId);
    const score = Math.round((data.correct / data.total) * 100);
    topicScores.push({
      topicId,
      topicName: topic?.name || 'Unknown',
      score,
      totalQuestions: data.total,
      correctAnswers: data.correct,
      status: getStatus(score),
    });
  });

  const totalCorrect = answers.filter(a => a.isCorrect).length;

  return {
    id: `attempt-${si + 1}`,
    assessmentId: 'assessment-1',
    studentId: student.id,
    answers,
    totalScore: Math.round((totalCorrect / questions.length) * 100),
    totalQuestions: questions.length,
    topicScores,
    completedAt: '2024-02-10T14:30:00Z',
    startedAt: '2024-02-10T13:45:00Z',
    completionTime: 45 * 60,
  };
});

interface AppState {
  // Auth
  currentUser: User | null;
  users: User[];
  
  // Data
  classes: ClassRoom[];
  classMembers: ClassMember[];
  topics: Topic[];
  prerequisites: TopicPrerequisite[];
  questions: Question[];
  assessments: Assessment[];
  attempts: AssessmentAttempt[];
  
  // UI State
  sidebarOpen: boolean;
  selectedTopicId: string | null;
  
  // Auth actions
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string, role: 'teacher' | 'student') => boolean;
  logout: () => void;
  
  // Class actions
  createClass: (data: Omit<ClassRoom, 'id' | 'joinCode' | 'teacherId' | 'archived' | 'createdAt'>) => ClassRoom;
  joinClass: (joinCode: string, studentId: string) => boolean;
  removeStudentFromClass: (classId: string, studentId: string) => void;
  
  // Topic actions
  createTopic: (data: Omit<Topic, 'id' | 'createdAt'>) => Topic;
  updateTopic: (id: string, data: Partial<Topic>) => void;
  deleteTopic: (id: string) => void;
  
  // Prerequisite actions
  addPrerequisite: (topicId: string, prerequisiteId: string) => void;
  removePrerequisite: (topicId: string, prerequisiteId: string) => void;
  
  // Assessment actions
  createAssessment: (data: Omit<Assessment, 'id' | 'createdAt'>) => Assessment;
  createQuestion: (data: Omit<Question, 'id'>) => Question;
  submitAssessment: (attempt: Omit<AssessmentAttempt, 'id' | 'completedAt'>) => AssessmentAttempt;
  
  // UI actions
  setSidebarOpen: (open: boolean) => void;
  setSelectedTopicId: (id: string | null) => void;
  
  // Computed
  getClassTopicAnalysis: (classId: string) => ClassTopicAnalysis[];
  getClassInsights: (classId: string) => ClassInsight;
  getStudentTopicScores: (studentId: string) => TopicScore[];
  getStudentsByClass: (classId: string) => User[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      users: [
        {
          id: 'teacher-1',
          email: 'demo.teacher@example.com',
          name: 'Ms. Sarah Johnson',
          role: 'teacher',
          password: 'DemoTeacher123!',
          createdAt: '2024-01-01T10:00:00Z',
        },
        ...students,
      ],
      classes: [
        {
          id: 'class-1',
          name: 'Class 9 Computer Science',
          grade: '9',
          subject: 'Computer Science',
          academicYear: '2024-2025',
          description: 'Introduction to Computer Science concepts including programming fundamentals, logic, and algorithms.',
          joinCode: 'CS9X42',
          teacherId: 'teacher-1',
          archived: false,
          createdAt: '2024-01-10T10:00:00Z',
        },
      ],
      classMembers,
      topics,
      prerequisites,
      questions,
      assessments: [assessment],
      attempts,
      sidebarOpen: true,
      selectedTopicId: null,

      // Auth
      login: (email, password) => {
        const user = get().users.find(u => u.email === email && u.password === password);
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },
      register: (name, email, password, role) => {
        const exists = get().users.find(u => u.email === email);
        if (exists) return false;
        const newUser: User = {
          id: uuidv4(),
          email,
          name,
          role,
          password,
          createdAt: new Date().toISOString(),
        };
        set(state => ({ users: [...state.users, newUser], currentUser: newUser }));
        return true;
      },
      logout: () => set({ currentUser: null }),

      // Classes
      createClass: (data) => {
        const newClass: ClassRoom = {
          ...data,
          id: uuidv4(),
          joinCode: generateJoinCode(),
          teacherId: get().currentUser!.id,
          archived: false,
          createdAt: new Date().toISOString(),
        };
        set(state => ({ classes: [...state.classes, newClass] }));
        return newClass;
      },
      joinClass: (joinCode, studentId) => {
        const cls = get().classes.find(c => c.joinCode === joinCode && !c.archived);
        if (!cls) return false;
        const alreadyMember = get().classMembers.find(m => m.classId === cls.id && m.studentId === studentId);
        if (alreadyMember) return false;
        const member: ClassMember = {
          id: uuidv4(),
          classId: cls.id,
          studentId,
          joinedAt: new Date().toISOString(),
        };
        set(state => ({ classMembers: [...state.classMembers, member] }));
        return true;
      },
      removeStudentFromClass: (classId, studentId) => {
        set(state => ({
          classMembers: state.classMembers.filter(m => !(m.classId === classId && m.studentId === studentId)),
        }));
      },

      // Topics
      createTopic: (data) => {
        const topic: Topic = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
        set(state => ({ topics: [...state.topics, topic] }));
        return topic;
      },
      updateTopic: (id, data) => {
        set(state => ({
          topics: state.topics.map(t => t.id === id ? { ...t, ...data } : t),
        }));
      },
      deleteTopic: (id) => {
        set(state => ({
          topics: state.topics.filter(t => t.id !== id),
          prerequisites: state.prerequisites.filter(p => p.topicId !== id && p.prerequisiteId !== id),
        }));
      },

      // Prerequisites
      addPrerequisite: (topicId, prerequisiteId) => {
        const exists = get().prerequisites.find(p => p.topicId === topicId && p.prerequisiteId === prerequisiteId);
        if (exists) return;
        const prereq: TopicPrerequisite = { id: uuidv4(), topicId, prerequisiteId };
        set(state => ({ prerequisites: [...state.prerequisites, prereq] }));
      },
      removePrerequisite: (topicId, prerequisiteId) => {
        set(state => ({
          prerequisites: state.prerequisites.filter(p => !(p.topicId === topicId && p.prerequisiteId === prerequisiteId)),
        }));
      },

      // Assessments
      createAssessment: (data) => {
        const assessment: Assessment = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
        set(state => ({ assessments: [...state.assessments, assessment] }));
        return assessment;
      },
      createQuestion: (data) => {
        const question: Question = { ...data, id: uuidv4() };
        set(state => ({ questions: [...state.questions, question] }));
        return question;
      },
      submitAssessment: (attemptData) => {
        const attempt: AssessmentAttempt = {
          ...attemptData,
          id: uuidv4(),
          completedAt: new Date().toISOString(),
        };
        set(state => ({ attempts: [...state.attempts, attempt] }));
        return attempt;
      },

      // UI
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSelectedTopicId: (id) => set({ selectedTopicId: id }),

      // Computed
      getClassTopicAnalysis: (classId) => {
        const state = get();
        const classTopics = state.topics.filter(t => t.classId === classId);
        const classAttempts = state.attempts.filter(a => {
          const assessment = state.assessments.find(ass => ass.id === a.assessmentId);
          return assessment?.classId === classId;
        });

        return classTopics.map(topic => {
          const topicAttempts = classAttempts.filter(a =>
            a.topicScores.some(ts => ts.topicId === topic.id)
          );

          const scores = topicAttempts.map(a => {
            const ts = a.topicScores.find(ts => ts.topicId === topic.id);
            return ts?.score || 0;
          });

          const averageScore = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

          const strongCount = scores.filter(s => s >= 80).length;
          const developingCount = scores.filter(s => s >= 60 && s < 80).length;
          const needsAttentionCount = scores.filter(s => s < 60).length;

          const prereqIds = state.prerequisites
            .filter(p => p.topicId === topic.id)
            .map(p => p.prerequisiteId);

          const nextTopicIds = state.prerequisites
            .filter(p => p.prerequisiteId === topic.id)
            .map(p => p.topicId);

          return {
            topicId: topic.id,
            topicName: topic.name,
            studentsAssessed: topicAttempts.length,
            averageScore,
            strongCount,
            developingCount,
            needsAttentionCount,
            status: getStatus(averageScore),
            prerequisiteIds: prereqIds,
            nextTopicIds,
          };
        });
      },

      getClassInsights: (classId) => {
        const analysis = get().getClassTopicAnalysis(classId);
        const state = get();

        const sorted = [...analysis].sort((a, b) => b.averageScore - a.averageScore);
        const strongestTopic = sorted.length > 0 ? { name: sorted[0].topicName, score: sorted[0].averageScore } : null;
        const weakestTopic = sorted.length > 0 ? { name: sorted[sorted.length - 1].topicName, score: sorted[sorted.length - 1].averageScore } : null;

        const topicNeedingSupport = analysis.reduce((max, t) =>
          t.needsAttentionCount > (max?.studentsCount || 0)
            ? { name: t.topicName, studentsCount: t.needsAttentionCount }
            : max,
          null as { name: string; studentsCount: number } | null
        );

        // Find prerequisite chains with issues
        const prerequisiteIssues: { chain: string[]; description: string }[] = [];
        analysis.forEach(topic => {
          if (topic.status === 'Needs Attention' || topic.status === 'Developing') {
            topic.prerequisiteIds.forEach(prereqId => {
              const prereqAnalysis = analysis.find(a => a.topicId === prereqId);
              if (prereqAnalysis && prereqAnalysis.averageScore < 70) {
                const chain = [prereqAnalysis.topicName, topic.topicName];
                // Check if prereq also has weak prereqs
                prereqAnalysis.prerequisiteIds.forEach(ppId => {
                  const ppAnalysis = analysis.find(a => a.topicId === ppId);
                  if (ppAnalysis && ppAnalysis.averageScore < 70) {
                    chain.unshift(ppAnalysis.topicName);
                  }
                });
                prerequisiteIssues.push({
                  chain,
                  description: `Consider reviewing ${chain.slice(0, -1).join(' and ')} before moving deeper into ${topic.topicName}.`,
                });
              }
            });
          }
        });

        // Students needing support
        const classAttempts = state.attempts.filter(a => {
          const assessment = state.assessments.find(ass => ass.id === a.assessmentId);
          return assessment?.classId === classId;
        });

        const studentsNeedingSupport = classAttempts.filter(a => {
          const weakTopics = a.topicScores.filter(ts => ts.status === 'Needs Attention');
          return weakTopics.length >= 2;
        }).length;

        // Recommendation
        const weakTopics = sorted.filter(t => t.averageScore < 70);
        let recommendation = 'The class is performing well across all topics. Consider introducing advanced concepts.';
        if (weakTopics.length > 0) {
          const topicNames = weakTopics.map(t => t.topicName).join(', ');
          recommendation = `Consider reviewing ${topicNames} with targeted practice activities before advancing to dependent topics.`;
        }

        return {
          strongestTopic,
          weakestTopic,
          topicNeedingSupport,
          prerequisiteIssues: prerequisiteIssues.slice(0, 3),
          studentsNeedingSupport,
          recommendation,
        };
      },

      getStudentTopicScores: (studentId) => {
        const state = get();
        const studentAttempts = state.attempts.filter(a => a.studentId === studentId);
        if (studentAttempts.length === 0) return [];

        // Aggregate topic scores across all attempts
        const topicMap: Record<string, { total: number; count: number; name: string }> = {};
        studentAttempts.forEach(attempt => {
          attempt.topicScores.forEach(ts => {
            if (!topicMap[ts.topicId]) {
              topicMap[ts.topicId] = { total: 0, count: 0, name: ts.topicName };
            }
            topicMap[ts.topicId].total += ts.score;
            topicMap[ts.topicId].count++;
          });
        });

        return Object.entries(topicMap).map(([topicId, data]) => ({
          topicId,
          topicName: data.name,
          score: Math.round(data.total / data.count),
          totalQuestions: 0,
          correctAnswers: 0,
          status: getStatus(Math.round(data.total / data.count)),
        }));
      },

      getStudentsByClass: (classId) => {
        const state = get();
        const memberIds = state.classMembers
          .filter(m => m.classId === classId)
          .map(m => m.studentId);
        return state.users.filter(u => memberIds.includes(u.id));
      },
    }),
    {
      name: 'class-knowledge-map-storage',
    }
  )
);
