import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useWords } from '../hooks/useStorage';
import { Word } from '../types';

const WordBookScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const { words, loading } = useWords();

  const filteredWords = words.filter(word =>
    word.word.toLowerCase().includes(searchText.toLowerCase()) ||
    word.meaning.includes(searchText)
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'learned':
        return styles.statusLearned;
      case 'learning':
        return styles.statusLearning;
      case 'new':
        return styles.statusNew;
      default:
        return styles.statusNew;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'learned':
        return '已掌握';
      case 'learning':
        return '学习中';
      case 'new':
        return '新词';
      default:
        return '新词';
    }
  };

  const renderWordItem = ({ item }: { item: Word }) => (
    <View style={styles.wordItem}>
      <View style={styles.wordInfo}>
        <Text style={styles.wordTitle}>{item.word}</Text>
        <Text style={styles.wordMeaning}>{item.meaning}</Text>
      </View>
      <View style={[styles.wordStatus, getStatusStyle(item.status)]}>
        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
      </View>
    </View>
  );

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

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索单词..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.mainContent}>
        {filteredWords.length > 0 ? (
          <FlatList
            data={filteredWords}
            renderItem={renderWordItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.wordList}
          />
        ) : (
          <View style={styles.noWordsContainer}>
            <Text style={styles.noWordsText}>
              {searchText ? '没有找到匹配的单词' : '暂无单词'}
            </Text>
          </View>
        )}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  wordList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  wordItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  wordInfo: {
    flex: 1,
  },
  wordTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  wordMeaning: {
    fontSize: 14,
    color: '#666',
  },
  wordStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusLearned: {
    backgroundColor: '#e3f2fd',
  },
  statusLearning: {
    backgroundColor: '#fff3e0',
  },
  statusNew: {
    backgroundColor: '#f3e5f5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default WordBookScreen;