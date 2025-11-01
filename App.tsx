/**
 * 大家号，这是我第一次制作听
 * from the start
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>测试页面</Text>
      <Text style={styles.subtitle}>
        如果你能看到这条文字，说明基本环境配置正常
      </Text>
      <Text style={styles.version}>
        React Native 版本: 0.82.1
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
  },
  version: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
