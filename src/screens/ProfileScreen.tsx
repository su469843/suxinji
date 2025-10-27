import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser } from '../hooks/useStorage';

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  screen?: string;
}

interface ProfileScreenProps {
  navigation?: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, loading } = useUser();
  
  const menuItems: MenuItem[] = [
    { id: '1', title: '学习设置', icon: 'settings' },
    { id: '2', title: '学习报告', icon: 'assessment' },
    { id: '3', title: '提醒设置', icon: 'notifications' },
    { id: '4', title: '用户协议', icon: 'description', screen: 'UserAgreementView' },
    { id: '5', title: '关于我们', icon: 'info' },
  ];

  const handleMenuPress = (item: MenuItem) => {
    if (item.screen && navigation) {
      navigation.navigate(item.screen);
    } else {
      console.log('Menu item pressed:', item.id);
    }
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => handleMenuPress(item)}>
      <Text style={styles.menuText}>{item.title}</Text>
      <Icon name="chevron-right" size={20} color="#ccc" />
    </TouchableOpacity>
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

      <View style={styles.mainContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.avatar || 'U'}</Text>
          </View>
          <Text style={styles.username}>{user?.name || '用户'}</Text>
          <Text style={styles.userLevel}>英语学习者 · Lv.{user?.level || 1}</Text>
          
          <View style={styles.userStats}>
            <View style={styles.userStat}>
              <Text style={styles.userStatNumber}>{user?.stats.totalWords || 0}</Text>
              <Text style={styles.userStatLabel}>已学单词</Text>
            </View>
            <View style={styles.userStat}>
              <Text style={styles.userStatNumber}>{user?.stats.consecutiveDays || 0}</Text>
              <Text style={styles.userStatLabel}>连续天数</Text>
            </View>
            <View style={styles.userStat}>
              <Text style={styles.userStatNumber}>{user?.stats.correctRate || 0}%</Text>
              <Text style={styles.userStatLabel}>正确率</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <FlatList
            data={menuItems}
            renderItem={renderMenuItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
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
  profileSection: {
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  userLevel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
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
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default ProfileScreen;