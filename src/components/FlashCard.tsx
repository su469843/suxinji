import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Word } from '../types';

interface FlashCardProps {
  word: Word;
  currentIndex: number;
  totalWords: number;
  onFlip: () => void;
  onAudioPress: () => void;
  onDifficultySelect: (difficulty: 'easy' | 'normal' | 'hard') => void;
}

const FlashCard: React.FC<FlashCardProps> = ({
  word,
  currentIndex,
  totalWords,
  onFlip,
  onAudioPress,
  onDifficultySelect,
}) => {
  const flipAnimation = React.useRef(new Animated.Value(0)).current;

  const handleFlip = () => {
    Animated.sequence([
      Animated.timing(flipAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(flipAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    onFlip();
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Animated.View style={[styles.card, frontAnimatedStyle]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardNumber}>
              {currentIndex + 1}/{totalWords}
            </Text>
            <TouchableOpacity style={styles.audioButton} onPress={onAudioPress}>
              <Icon name="volume-up" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.word}>{word.word}</Text>
          <Text style={styles.pronunciation}>{word.pronunciation}</Text>
          <Text style={styles.meaning}>{word.meaning}</Text>
          <TouchableOpacity style={styles.flipHint} onPress={handleFlip}>
            <Text style={styles.flipText}>点击翻转</Text>
            <Icon name="refresh" size={16} color="#4facfe" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.hardButton]}
          onPress={() => onDifficultySelect('hard')}>
          <Text style={styles.hardButtonText}>困难</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.normalButton]}
          onPress={() => onDifficultySelect('normal')}>
          <Text style={styles.normalButtonText}>一般</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.easyButton]}
          onPress={() => onDifficultySelect('easy')}>
          <Text style={styles.easyButtonText}>简单</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  cardContainer: {
    perspective: 1000,
  },
  card: {
    width: 320,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 30,
  },
  cardHeader: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumber: {
    fontSize: 14,
    color: '#999',
  },
  audioButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  word: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  pronunciation: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  meaning: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },
  flipHint: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flipText: {
    fontSize: 12,
    color: '#4facfe',
    marginRight: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    minWidth: 80,
    alignItems: 'center',
  },
  hardButton: {
    backgroundColor: '#ff6b6b',
  },
  normalButton: {
    backgroundColor: '#ffd93d',
  },
  easyButton: {
    backgroundColor: '#6bcf7f',
  },
  hardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  normalButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  easyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FlashCard;