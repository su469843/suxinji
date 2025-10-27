import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useUser, useReviewProgress, useWords } from '../hooks/useStorage';

const circleSize = 200;
const strokeWidth = 20;

const ReviewScreen: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const { progress: reviewProgress, loading: progressLoading } = useReviewProgress();
  const { words, loading: wordsLoading } = useWords();
  
  const loading = userLoading || progressLoading || wordsLoading;
  
  // Calculate progress based on words to review
  const wordsToReview = words.filter(word => word.status === 'learning' || word.difficulty === 'hard');
  const totalWordsToReview = Math.max(wordsToReview.length, 20); // Minimum 20 for demo
  const progress = totalWordsToReview > 0 ? reviewProgress.todayReviewed / totalWordsToReview : 0;

  const handleStartReview = () => {
    console.log('Start review session');
  };

  const handleContinueReview = () => {
    console.log('Continue last review session');
  };

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
      </LinearGradient>

      <View style={styles.mainContent}>
        <View style={styles.reviewStats}>
          <Text style={styles.reviewTitle}>今日复习进度</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
              <View style={styles.progressInner}>
                <Text style={styles.progressPercentage}>{Math.round(progress * 100)}%</Text>
                <Text style={styles.progressText}>{reviewProgress.todayReviewed}/{totalWordsToReview} 完成</Text>
              </View>
            </View>
            
            {/* Progress circle overlay using a View with border */}
            <View style={[styles.progressOverlay, { transform: [{ rotate: '-90deg' }] }]}>
              <View 
                style={[
                  styles.progressTrack, 
                  styles.progressTrackActive,
                  { transform: [{ rotate: `${progress * 360}deg` }] }
                ]} 
              />
            </View>
          </View>

          <View style={styles.reviewButtons}>
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={handleStartReview}>
              <Text style={styles.reviewButtonText}>开始复习</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reviewButton, styles.continueButton]}
              onPress={handleContinueReview}>
              <Text style={[styles.reviewButtonText, styles.continueButtonText]}>
                继续上次
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.reviewStats}>
          <Text style={styles.reviewTitle}>复习统计</Text>
          <View style={styles.userStats}>
            <View style={styles.userStat}>
              <Text style={styles.userStatNumber}>{user?.stats.totalReviews || 0}</Text>
              <Text style={styles.userStatLabel}>总复习</Text>
            </View>
            <View style={styles.userStat}>
              <Text style={styles.userStatNumber}>{user?.stats.correctRate || 0}%</Text>
              <Text style={styles.userStatLabel}>正确率</Text>
            </View>
            <View style={styles.userStat}>
              <Text style={styles.userStatNumber}>{user?.stats.consecutiveDays || 0}</Text>
              <Text style={styles.userStatLabel}>连续天数</Text>
            </View>
          </View>
        </View>
      </View>
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
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  reviewStats: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  progressContainer: {
    width: circleSize,
    height: circleSize,
    marginBottom: 15,
    position: 'relative',
  },
  progressCircle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressInner: {
    width: circleSize - strokeWidth * 2,
    height: circleSize - strokeWidth * 2,
    borderRadius: (circleSize - strokeWidth * 2) / 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: circleSize,
    height: circleSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTrack: {
    position: 'absolute',
    borderWidth: strokeWidth,
  },
  progressTrackActive: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#4facfe',
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4facfe',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  reviewButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  reviewButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#4facfe',
  },
  continueButton: {
    backgroundColor: '#f0f0f0',
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  continueButtonText: {
    color: '#333',
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  userStat: {
    alignItems: 'center',
  },
  userStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4facfe',
  },
  userStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default ReviewScreen;