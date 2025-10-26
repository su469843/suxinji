# 速记星 - AI智能英语单词学习应用

一个基于React Native开发的英语单词学习应用，集成了AI记忆助手，帮助用户更高效地记忆英语单词。

## 功能特点

- 📚 **单词学习** - 卡片式学习界面，支持音频播放
- 📖 **单词本管理** - 搜索、分类、进度追踪
- 🔄 **智能复习** - 基于遗忘曲线的复习系统
- 🤖 **AI记忆助手** - 智能记忆技巧、例句生成、学习计划
- 👤 **个人中心** - 学习统计、成就系统
- 💾 **数据持久化** - 本地存储，学习进度不丢失

## 技术栈

- **React Native** - 跨平台移动应用开发
- **TypeScript** - 类型安全的JavaScript
- **React Navigation** - 导航管理
- **AsyncStorage** - 本地数据存储
- **Linear Gradient** - 渐变效果
- **Vector Icons** - 图标库
- **AI Integration** - DeepSeek API集成

## 安装和运行

### 环境要求

- Node.js >= 16
- React Native CLI
- Android Studio / Xcode

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/your-username/EnglishFlashcardApp.git
cd EnglishFlashcardApp
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的API密钥
```

4. 运行应用
```bash
# Android
npm run android

# iOS
npm run ios
```

## 环境变量配置

创建 `.env` 文件并配置以下变量：

```env
# AI服务配置
AI_API_KEY=your_openrouter_api_key_here
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=deepseek/deepseek-chat-v3.1:free
```

### 获取API密钥

1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册账户并获取API密钥
3. 将密钥填入 `.env` 文件的 `AI_API_KEY` 变量

## 项目结构

```
src/
├── components/        # 可复用组件
│   └── FlashCard.tsx
├── screens/          # 界面组件
│   ├── LearningScreen.tsx
│   ├── WordBookScreen.tsx
│   ├── ReviewScreen.tsx
│   ├── AIAssistantScreen.tsx
│   └── ProfileScreen.tsx
├── services/         # 服务层
│   ├── AIService.ts
│   ├── AudioService.ts
│   └── StorageService.ts
├── hooks/           # 自定义Hooks
│   └── useStorage.ts
├── navigation/      # 导航配置
│   └── AppNavigator.tsx
├── types/           # TypeScript类型定义
│   └── index.ts
└── data/           # 模拟数据
    └── mockData.ts
```

## AI功能说明

### AI记忆助手

- **记忆技巧生成** - 为每个单词提供个性化的记忆方法
- **例句生成** - 根据用户水平生成合适的例句
- **学习计划制定** - 基于学习数据智能推荐学习计划
- **实时对话** - 支持自然语言交互，解答学习疑问

### API集成

应用集成了DeepSeek API，提供智能学习辅助功能。如果没有API密钥，应用会使用模拟响应用于演示。

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件至 your-email@example.com

---

**注意**: 请确保不要将包含真实API密钥的 `.env` 文件提交到版本控制系统。"# suxinji" 
"# suxinji" 
