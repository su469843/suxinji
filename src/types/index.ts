export interface Word {
  id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  status: 'new' | 'learning' | 'learned';
  difficulty?: 'easy' | 'normal' | 'hard';
}

export interface UserStats {
  totalWords: number;
  todayNewWords: number;
  consecutiveDays: number;
  correctRate: number;
  totalReviews: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  level: number;
  stats: UserStats;
}