import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LearningScreen from '../screens/LearningScreen';
import WordBookScreen from '../screens/WordBookScreen';
import ReviewScreen from '../screens/ReviewScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UserAgreementScreen from '../screens/UserAgreementScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Learning':
              iconName = 'school';
              break;
            case 'WordBook':
              iconName = 'book';
              break;
            case 'Review':
              iconName = 'repeat';
              break;
            case 'AIAssistant':
              iconName = 'smart-toy';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4facfe',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 20,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 2,
        },
        headerShown: false,
      })}>
      <Tab.Screen
        name="Learning"
        component={LearningScreen}
        options={{ title: '学习' }}
      />
      <Tab.Screen
        name="WordBook"
        component={WordBookScreen}
        options={{ title: '单词本' }}
      />
      <Tab.Screen
        name="Review"
        component={ReviewScreen}
        options={{ title: '复习' }}
      />
      <Tab.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{ title: 'AI助手' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: '我的' }}
      />
    </Tab.Navigator>
  );
};

interface AppNavigatorProps {
  needsAgreement: boolean;
  onAgreementAccepted: () => Promise<void> | void;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({
  needsAgreement,
  onAgreementAccepted,
}) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {needsAgreement ? (
        <Stack.Screen name="UserAgreement">
          {props => (
            <UserAgreementScreen
              {...props}
              fromFirstLaunch
              onAgree={onAgreementAccepted}
            />
          )}
        </Stack.Screen>
      ) : null}
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="UserAgreementView">
        {props => (
          <UserAgreementScreen
            {...props}
            fromFirstLaunch={false}
            onAgree={onAgreementAccepted}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default AppNavigator;