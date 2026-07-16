export interface UserMin {
  id: string;
  name: string;
}

export interface QuizAttempt {
  id: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  order: number;
}

export interface QuestionDraft {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number;
  isPublished: boolean;
  _count?: {
    questions: number;
  };
  createdBy: UserMin;
  attempts?: QuizAttempt[];
  questions?: QuizQuestion[];
}
