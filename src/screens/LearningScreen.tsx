import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FlashCard from '../components/FlashCard';
import AudioService from '../services/AudioService';
import AIService from '../services/AIService';
import { useWords, useUser, useLearningProgress } from '../hooks/useStorage';

const LearningScreen: React.FC = () => {
  const { words, loading: wordsLoading } = useWords();
  const { user, loading: userLoading } = useUser();
  const { progress, loading: progressLoading, updateProgress } = useLearningProgress();

  const loading = wordsLoading || userLoading || progressLoading;
  const currentWordIndex = progress.currentWordIndex;
  const progressPercentage = words.length > 0 ? ((currentWordIndex + 1) / words.length) * 100 : 0;

  const handleFlip = () => {
    console.log('Card flipped');
  };

  const handleAudioPress = async () => {
    if (words[currentWordIndex]) {
      try {
        await AudioService.playWordAudio(words[currentWordIndex].word);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const handleDifficultySelect = async (difficulty: 'easy' | 'normal' | 'hard') => {
    if (words[currentWordIndex]) {
      const wordId = words[currentWordIndex].id;
      await updateProgress(wordId, difficulty);
    }
  };

  const handleAIAssistant = async () => {
    if (currentWord) {
      try {
        Alert.alert(
          'AI记忆技巧',
          '正在获取记忆技巧...',
          [{ text: '确定' }]
        );
        
        const technique = await AIService.getMemoryTechnique(
          currentWord.word,
          currentWord.meaning
        );
        
        Alert.alert(
          `${currentWord.word} 记忆技巧`,
          technique,
          [{ text: '太棒了！' }]
        );
      } catch {
        Alert.alert(
          '提示',
          '暂时无法获取AI记忆技巧，请稍后再试。',
          [{ text: '确定' }]
        );
      }
    }
  };

  const currentWord = words[currentWordIndex];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4facfe" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#4facfe', '#00f2fe']}
        style={styles.header}>
        <Text style={styles.headerTitle}>速记星</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` }
              ]}
            />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.stats.totalWords || 0}</Text>
          <Text style={styles.statLabel}>已学习</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.stats.todayNewWords || 0}</Text>
          <Text style={styles.statLabel}>今日新词</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.stats.consecutiveDays || 0}</Text>
          <Text style={styles.statLabel}>连续天数</Text>
        </View>
      </View>

      <View style={styles.mainContent}>
        {currentWord ? (
          <FlashCard
            word={currentWord}
            currentIndex={currentWordIndex}
            totalWords={words.length}
            onFlip={handleFlip}
            onAudioPress={handleAudioPress}
            onDifficultySelect={handleDifficultySelect}
          />
        ) : (
          <View style={styles.noWordsContainer}>
            <Text style={styles.noWordsText}>没有更多单词了</Text>
            <Text style={styles.noWordsSubtext}>恭喜您完成了所有单词的学习！</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.floatingButton}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.aiAssistantButton} onPress={handleAIAssistant}>
        <Icon name="smart-toy" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4facfe',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  aiAssistantButton: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  noWordsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noWordsText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  noWordsSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default LearningScreen;