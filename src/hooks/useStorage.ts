import { useState, useEffect } from 'react';
import StorageService from '../services/StorageService';
import { Word, User } from '../types';

export const useWords = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      setLoading(true);
      const storedWords = await StorageService.getWords();
      setWords(storedWords);
    } catch (error) {
      console.error('Error loading words:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWord = async (word: Word) => {
    try {
      await StorageService.addWord(word);
      await loadWords(); // Refresh the list
    } catch (error) {
      console.error('Error adding word:', error);
    }
  };

  const updateWord = async (wordId: string, updates: Partial<Word>) => {
    try {
      await StorageService.updateWord(wordId, updates);
      await loadWords(); // Refresh the list
    } catch (error) {
      console.error('Error updating word:', error);
    }
  };

  const deleteWord = async (wordId: string) => {
    try {
      await StorageService.deleteWord(wordId);
      await loadWords(); // Refresh the list
    } catch (error) {
      console.error('Error deleting word:', error);
    }
  };

  return {
    words,
    loading,
    addWord,
    updateWord,
    deleteWord,
    refreshWords: loadWords,
  };
};

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const storedUser = await StorageService.getUser();
      setUser(storedUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      if (user) {
        const updatedUser = { ...user, ...updates };
        await StorageService.saveUser(updatedUser);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const updateUserStats = async (stats: Partial<User['stats']>) => {
    try {
      if (user) {
        const updatedUser = {
          ...user,
          stats: { ...user.stats, ...stats },
        };
        await StorageService.saveUser(updatedUser);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  return {
    user,
    loading,
    updateUser,
    updateUserStats,
    refreshUser: loadUser,
  };
};

export const useLearningProgress = () => {
  const [progress, setProgress] = useState({ currentWordIndex: 0, completedWords: [] as string[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const storedProgress = await StorageService.getLearningProgress();
      setProgress(storedProgress);
    } catch (error) {
      console.error('Error loading learning progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (wordId: string, difficulty: 'easy' | 'normal' | 'hard') => {
    try {
      await StorageService.updateLearningProgress(wordId, difficulty);
      await loadProgress(); // Refresh the progress
    } catch (error) {
      console.error('Error updating learning progress:', error);
    }
  };

  const resetProgress = async () => {
    try {
      await StorageService.saveLearningProgress({ currentWordIndex: 0, completedWords: [] });
      await loadProgress(); // Refresh the progress
    } catch (error) {
      console.error('Error resetting learning progress:', error);
    }
  };

  return {
    progress,
    loading,
    updateProgress,
    resetProgress,
    refreshProgress: loadProgress,
  };
};

export const useReviewProgress = () => {
  const [progress, setProgress] = useState({
    todayReviewed: 0,
    totalReviewed: 0,
    correctAnswers: 0,
    totalAnswers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const storedProgress = await StorageService.getReviewProgress();
      setProgress(storedProgress);
    } catch (error) {
      console.error('Error loading review progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (isCorrect: boolean) => {
    try {
      await StorageService.updateReviewProgress(isCorrect);
      await loadProgress(); // Refresh the progress
    } catch (error) {
      console.error('Error updating review progress:', error);
    }
  };

  return {
    progress,
    loading,
    updateProgress,
    refreshProgress: loadProgress,
  };
};

export const useAppInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      await StorageService.initializeApp();
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetApp = async () => {
    try {
      await StorageService.clearAllData();
      await initializeApp();
    } catch (error) {
      console.error('Error resetting app:', error);
    }
  };

  return {
    isInitialized,
    loading,
    resetApp,
  };
};