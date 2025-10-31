import { UserStats } from '../types';
import '@env';

class AIService {
  private baseUrl: string;
  private apiKey: string;
  private model: string;

  constructor() {
    // 配置API基础URL和密钥
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.apiKey = ''; // 在这里填入你的API密钥，如果为空则使用模拟响应
    this.model = 'deepseek/deepseek-chat-v3.1:free';
    
    if (!this.apiKey) {
      console.warn('AI_API_KEY not configured. Using mock responses.');
    }
  }

  async sendMessage(message: string, userStats?: UserStats): Promise<string> {
    try {
      // 构建上下文信息
      const context = this.buildContext(userStats);
      
      // 调用AI API
      const response = await this.callAI(message, context);
      
      return response;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  async getMemoryTechnique(word: string, meaning: string): Promise<string> {
    const prompt = `请为英语单词 "${word}"（含义：${meaning}）提供有效的记忆技巧，包括：
1. 词根词缀分析
2. 联想记忆法
3. 一个实用的例句
请用简洁的中文回答。`;

    try {
      return await this.callAI(prompt);
    } catch (error) {
      console.error('Error getting memory technique:', error);
      return '抱歉，暂时无法获取记忆技巧。请稍后再试。';
    }
  }

  async generateExample(word: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<string> {
    const difficultyMap = {
      easy: '简单日常',
      medium: '中等难度',
      hard: '复杂专业'
    };

    const prompt = `请为英语单词 "${word}" 生成一个${difficultyMap[difficulty]}的例句，并提供中文翻译。例句应该实用且易于理解。`;

    try {
      return await this.callAI(prompt);
    } catch (error) {
      console.error('Error generating example:', error);
      return '抱歉，暂时无法生成例句。请稍后再试。';
    }
  }

  async createStudyPlan(userStats: UserStats, targetWords: number): Promise<string> {
    const prompt = `根据用户的学习数据：
- 已学单词：${userStats.totalWords}个
- 正确率：${userStats.correctRate}%
- 连续学习：${userStats.consecutiveDays}天

请制定一个${targetWords}个单词的学习计划，包括：
1. 每天建议学习的新单词数量
2. 复习频率建议
3. 学习方法推荐
请用简洁的中文回答。`;

    try {
      return await this.callAI(prompt);
    } catch (error) {
      console.error('Error creating study plan:', error);
      return '抱歉，暂时无法制定学习计划。请稍后再试。';
    }
  }

  async analyzeWord(word: string): Promise<{
    pronunciation: string;
    meaning: string;
    difficulty: 'easy' | 'medium' | 'hard';
    relatedWords: string[];
  }> {
    const prompt = `请分析英语单词 "${word}"，提供以下信息（JSON格式）：
{
  "pronunciation": "音标",
  "meaning": "中文含义",
  "difficulty": "easy/medium/hard",
  "relatedWords": ["相关词汇1", "相关词汇2", "相关词汇3"]
}`;

    try {
      const response = await this.callAI(prompt);
      // 尝试解析JSON响应
      try {
        return JSON.parse(response);
      } catch {
        // 如果解析失败，返回默认值
        return {
          pronunciation: '/unknown/',
          meaning: '未知',
          difficulty: 'medium',
          relatedWords: [],
        };
      }
    } catch (error) {
      console.error('Error analyzing word:', error);
      return {
        pronunciation: '/error/',
        meaning: '分析失败',
        difficulty: 'medium',
        relatedWords: [],
      };
    }
  }

  private buildContext(userStats?: UserStats): string {
    if (!userStats) {
      return '用户是新用户，刚开始学习英语单词。';
    }

    return `用户学习情况：
- 已学单词：${userStats.totalWords}个
- 今日新词：${userStats.todayNewWords}个
- 连续学习：${userStats.consecutiveDays}天
- 正确率：${userStats.correctRate}%
- 总复习次数：${userStats.totalReviews}次

请根据用户的学习水平提供个性化的建议。`;
  }

  private async callAI(prompt: string, context?: string): Promise<string> {
    // 如果没有API密钥，返回模拟响应
    if (!this.apiKey) {
      return this.getMockResponse(prompt);
    }

    // 构建完整的提示
    const fullPrompt = context ? `${context}\n\n用户问题：${prompt}` : prompt;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://github.com/your-username/speed-memory-star',
          'X-Title': 'Speed Memory Star',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的英语单词学习助手，擅长提供记忆技巧和学习建议。请用简洁的中文回答。'
            },
            {
              role: 'user',
              content: fullPrompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (error) {
      console.error('AI API call failed:', error);
      // API失败时返回模拟响应作为后备
      return this.getMockResponse(prompt);
    }
  }

  private getMockResponse(prompt: string): string {
    // 模拟AI响应，用于演示
    if (prompt.includes('记忆技巧') || prompt.includes('怎么记')) {
      return '这里有一些记忆技巧：\n\n1. 词根法：分析单词的构成部分\n2. 联想法：与已知事物建立联系\n3. 情景法：在具体场景中使用单词\n\n需要我为特定单词提供记忆技巧吗？';
    }
    
    if (prompt.includes('例句')) {
      return '我可以为您生成个性化的例句。请告诉我您想要练习的单词，我会根据您的水平创建合适的句子。';
    }
    
    if (prompt.includes('学习计划')) {
      return '根据您的学习进度，我建议：\n\n📅 每日计划：\n- 新单词：5-10个\n- 复习：20-30个\n- 练习：15分钟\n\n🎯 学习技巧：\n- 使用间隔重复法\n- 结合听说读写\n- 定期自我测试\n\n需要更详细的计划吗？';
    }
    
    if (prompt.includes('Adventure')) {
      return '"Adventure" (冒险) 的记忆技巧：\n\n1. 词根分析：ad(向) + venture(冒险) = 冒险\n2. 联想记忆：想象自己是一位冒险家(adventurer)\n3. 例句：Life is an adventure full of surprises. (生活充满惊喜的冒险)\n\n这样记忆会更深刻！';
    }
    
    if (prompt.includes('Beautiful')) {
      return '"Beautiful" (美丽的) 记忆方法：\n\n1. 拆分记忆：beauty(美) + ful(充满) = 充满美的\n2. 谐音联想："比优特佛" - 比较优美特别\n3. 例句：The sunset is beautiful tonight. (今晚的日落很美)\n\n多练习几遍就记住啦！';
    }
    
    return '我是您的AI学习助手！我可以帮您：\n\n🧠 提供单词记忆技巧\n📝 生成个性化例句\n📋 制定学习计划\n🎯 解答学习疑问\n\n有什么具体问题吗？';
  }
}

export default new AIService();
