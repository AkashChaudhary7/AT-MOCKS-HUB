// @ts-nocheck
export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  subject: string;
  topic?: string;
  subtopic?: string;
  difficulty?: string;
  tags?: string[];
  explanation?: string;
}

export interface TestAttempt {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  subject: string;
  answers?: any;
  scorePercentage?: number;
  correctCount?: number;
  incorrectCount?: number;
  unattemptedCount?: number;
  mode?: string;
  timeTaken?: number;
}

export interface QuizSettings {
  questionCount: number;
  difficulty?: string;
  subject: string;
  hasTimer?: boolean;
  durationMinutes?: number;
  correctAnswerMarks?: number;
  negativeMarking?: number;
}

export interface ExamCounter {
  id: string;
  name: string;
  targetDate: string;
}

export interface DailyGoal {
  target: number;
  current: number;
}

export interface ExamConfig {
  id: string;
  name: string;
  subjectDistribution: Record<string, number>;
  totalQuestions: number;
  durationMinutes: number;
  sourceExamTag?: string;
  deadline?: string;
  subjectSources?: Record<string, string>;
  correctAnswerMarks?: number;
  negativeMarking?: number;
}

export interface UserAnswer {
  questionId: string;
  selectedIndex: number | null;
  isCorrect: boolean;
}
