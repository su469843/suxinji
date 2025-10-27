import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useUserAgreementStatus } from '../hooks/useStorage';

interface UserAgreementScreenProps {
  route?: {
    params?: {
      fromFirstLaunch?: boolean;
    };
  };
  navigation?: any;
  fromFirstLaunch?: boolean;
  onAgree?: () => Promise<void> | void;
}

const UserAgreementScreen: React.FC<UserAgreementScreenProps> = ({
  route,
  navigation,
  fromFirstLaunch: fromFirstLaunchProp,
  onAgree,
}) => {
  const [agreementContent, setAgreementContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { acceptAgreement } = useUserAgreementStatus();
  const fromFirstLaunch = fromFirstLaunchProp ?? route?.params?.fromFirstLaunch ?? false;

  useEffect(() => {
    loadAgreementContent();
  }, []);

  const loadAgreementContent = async () => {
    try {
      setLoading(true);
      const asset = require('../../assets/legal/user-agreement.zh-CN.md');
      const source = Image.resolveAssetSource(asset);

      if (!source?.uri) {
        throw new Error('Asset URI not found');
      }

      const response = await fetch(source.uri);
      const text = await response.text();
      setAgreementContent(text);
    } catch (error) {
      console.error('Error loading agreement content:', error);
      setAgreementContent('加载用户协议失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  const handleAgree = async () => {
    if (onAgree) {
      await onAgree();
    } else {
      await acceptAgreement();
    }

    if (navigation) {
      if (fromFirstLaunch) {
        navigation.replace('Main');
      } else {
        navigation.goBack();
      }
    }
  };

  const handleDisagree = () => {
    Alert.alert(
      '提示',
      '您需要同意用户协议才能继续使用本应用',
      [{ text: '我知道了', style: 'default' }]
    );
  };

  const handleGoBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const renderContent = () => {
    const lines = agreementContent.split('\n');

    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return (
          <Text key={index} style={styles.heading1}>
            {line.replace('# ', '')}
          </Text>
        );
      } else if (line.startsWith('## ')) {
        return (
          <Text key={index} style={styles.heading2}>
            {line.replace('## ', '')}
          </Text>
        );
      } else if (line.startsWith('---')) {
        return <View key={index} style={styles.divider} />;
      } else if (line.trim() === '') {
        return <View key={index} style={styles.paragraph} />;
      } else {
        return (
          <Text key={index} style={styles.bodyText}>
            {line}
          </Text>
        );
      }
    });
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

      <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.header}>
        <Text style={styles.headerTitle}>用户协议</Text>
      </LinearGradient>

      <ScrollView style={styles.contentContainer} contentContainerStyle={styles.contentInner}>
        {renderContent()}
      </ScrollView>

      {fromFirstLaunch ? (
        <View style={styles.actionContainer}>
          <Text style={styles.hintText}>请仔细阅读并同意用户协议以继续使用</Text>
          <TouchableOpacity style={styles.agreeButton} onPress={handleAgree}>
            <Text style={styles.agreeButtonText}>同意并继续</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.disagreeButton} onPress={handleDisagree}>
            <Text style={styles.disagreeButtonText}>不同意</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  contentContainer: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 5,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
    marginTop: 15,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
    marginBottom: 5,
  },
  paragraph: {
    height: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  actionContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  hintText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  agreeButton: {
    backgroundColor: '#4facfe',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  agreeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disagreeButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  disagreeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#4facfe',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserAgreementScreen;
