/**
 * @format
 */

import { LogBox, AppRegistry } from 'react-native';

// 忽略所有日志通知（这步可选，但能减少干扰）
LogBox.ignoreAllLogs();

import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
