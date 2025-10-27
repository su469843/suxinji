import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word, User, UserStats } from '../types';

const STORAGE_KEYS = {
  WORDS: '@english_flashcard_words',
  USER: '@english_flashcard_user',
  USER_STATS: '@english_flashcard_user_stats',
  LEARNING_PROGRESS: '@english_flashcard_learning_progress',
  REVIEW_PROGRESS: '@english_flashcard_review_progress',
  USER_AGREEMENT_ACCEPTED_VERSION: '@english_flashcard_user_agreement_accepted_version',
};

export const AGREEMENT_VERSION = '1';

class StorageService {
  // Word operations
  async getWords(): Promise<Word[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.WORDS);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error loading words:', e);
      return [];
    }
  }

  async saveWords(words: Word[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(words);
      await AsyncStorage.setItem(STORAGE_KEYS.WORDS, jsonValue);
    } catch (e) {
      console.error('Error saving words:', e);
    }
  }

  async addWord(word: Word): Promise<void> {
    try {
      const words = await this.getWords();
      words.push(word);
      await this.saveWords(words);
    } catch (e) {
      console.error('Error adding word:', e);
    }
  }

  async updateWord(wordId: string, updates: Partial<Word>): Promise<void> {
    try {
      const words = await this.getWords();
      const index = words.findIndex(word => word.id === wordId);
      if (index !== -1) {
        words[index] = { ...words[index], ...updates };
        await this.saveWords(words);
      }
    } catch (e) {
      console.error('Error updating word:', e);
    }
  }

  async deleteWord(wordId: string): Promise<void> {
    try {
      const words = await this.getWords();
      const filteredWords = words.filter(word => word.id !== wordId);
      await this.saveWords(filteredWords);
    } catch (e) {
      console.error('Error deleting word:', e);
    }
  }

  // User operations
  async getUser(): Promise<User | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Error loading user:', e);
      return null;
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      const jsonValue = JSON.stringify(user);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, jsonValue);
    } catch (e) {
      console.error('Error saving user:', e);
    }
  }

  async updateUserStats(stats: Partial<UserStats>): Promise<void> {
    try {
      const user = await this.getUser();
      if (user) {
        user.stats = { ...user.stats, ...stats };
        await this.saveUser(user);
      }
    } catch (e) {
      console.error('Error updating user stats:', e);
    }
  }

  // Learning progress operations
  async getLearningProgress(): Promise<{ currentWordIndex: number; completedWords: string[] }> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.LEARNING_PROGRESS);
      return jsonValue != null ? JSON.parse(jsonValue) : { currentWordIndex: 0, completedWords: [] };
    } catch (e) {
      console.error('Error loading learning progress:', e);
      return { currentWordIndex: 0, completedWords: [] };
    }
  }

  async saveLearningProgress(progress: { currentWordIndex: number; completedWords: string[] }): Promise<void> {
    try {
      const jsonValue = JSON.stringify(progress);
      await AsyncStorage.setItem(STORAGE_KEYS.LEARNING_PROGRESS, jsonValue);
    } catch (e) {
      console.error('Error saving learning progress:', e);
    }
  }

  async updateLearningProgress(wordId: string, difficulty: 'easy' | 'normal' | 'hard'): Promise<void> {
    try {
      const progress = await this.getLearningProgress();
      const words = await this.getWords();
      
      // Update word difficulty
      await this.updateWord(wordId, { difficulty });
      
      // Add to completed words if not already there
      if (!progress.completedWords.includes(wordId)) {
        progress.completedWords.push(wordId);
      }
      
      // Move to next word
      progress.currentWordIndex = Math.min(progress.currentWordIndex + 1, words.length - 1);
      
      await this.saveLearningProgress(progress);
      
      // Update user stats
      await this.updateUserStats({
        totalWords: progress.completedWords.length,
      });
    } catch (e) {
      console.error('Error updating learning progress:', e);
    }
  }

  // Review progress operations
  async getReviewProgress(): Promise<{ todayReviewed: number; totalReviewed: number; correctAnswers: number; totalAnswers: number }> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_PROGRESS);
      const today = new Date().toDateString();
      const stored = jsonValue != null ? JSON.parse(jsonValue) : { todayReviewed: 0, totalReviewed: 0, correctAnswers: 0, totalAnswers: 0, lastReviewDate: today };
      
      // Reset daily count if it's a new day
      if (stored.lastReviewDate !== today) {
        stored.todayReviewed = 0;
        stored.lastReviewDate = today;
      }
      
      return stored;
    } catch (e) {
      console.error('Error loading review progress:', e);
      return { todayReviewed: 0, totalReviewed: 0, correctAnswers: 0, totalAnswers: 0 };
    }
  }

  async saveReviewProgress(progress: { todayReviewed: number; totalReviewed: number; correctAnswers: number; totalAnswers: number; lastReviewDate?: string }): Promise<void> {
    try {
      const jsonValue = JSON.stringify(progress);
      await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_PROGRESS, jsonValue);
    } catch (e) {
      console.error('Error saving review progress:', e);
    }
  }

  async updateReviewProgress(isCorrect: boolean): Promise<void> {
    try {
      const progress = await this.getReviewProgress();
      progress.todayReviewed += 1;
      progress.totalReviewed += 1;
      progress.totalAnswers += 1;
      if (isCorrect) {
        progress.correctAnswers += 1;
      }
      
      await this.saveReviewProgress(progress);
      
      // Update user stats
      const correctRate = Math.round((progress.correctAnswers / progress.totalAnswers) * 100);
      await this.updateUserStats({
        totalReviews: progress.totalReviewed,
        correctRate,
      });
    } catch (e) {
      console.error('Error updating review progress:', e);
    }
  }

  async getUserAgreementAcceptedVersion(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(
        STORAGE_KEYS.USER_AGREEMENT_ACCEPTED_VERSION,
      );
    } catch (e) {
      console.error('Error loading user agreement acceptance:', e);
      return null;
    }
  }

  async setUserAgreementAcceptedVersion(version: string): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_AGREEMENT_ACCEPTED_VERSION,
        version,
      );
    } catch (e) {
      console.error('Error saving user agreement acceptance:', e);
    }
  }

  // Initialize app with default data if needed
  async initializeApp(): Promise<void> {
    try {
      const user = await this.getUser();
      const words = await this.getWords();
      
      // Create default user if doesn't exist
      if (!user) {
        const defaultUser = {
          id: '1',
          name: '用户',
          avatar: 'U',
          level: 1,
          stats: {
            totalWords: 0,
            todayNewWords: 0,
            consecutiveDays: 1,
            correctRate: 0,
            totalReviews: 0,
          },
        };
        await this.saveUser(defaultUser);
      }
      
      // Add default words if empty
      if (words.length === 0) {
        // Import and save default words
        const { mockWords } = await import('../data/mockData');
        await this.saveWords(mockWords);
      }
    } catch (e) {
      console.error('Error initializing app:', e);
    }
  }

  // Clear all data (for testing/reset)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (e) {
      console.error('Error clearing data:', e);
    }
  }
}

export default new StorageService();