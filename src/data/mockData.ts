import { Word, User } from '../types';

export const mockWords: Word[] = [
  {
    id: '1',
    word: 'Adventure',
    pronunciation: '/ədˈventʃər/',
    meaning: '冒险；奇遇',
    status: 'learning',
  },
  {
    id: '2',
    word: 'Beautiful',
    pronunciation: '/ˈbjuːtɪfl/',
    meaning: '美丽的；漂亮的',
    status: 'learned',
  },
  {
    id: '3',
    word: 'Challenge',
    pronunciation: '/ˈtʃælɪndʒ/',
    meaning: '挑战；考验',
    status: 'new',
  },
  {
    id: '4',
    word: 'Discover',
    pronunciation: '/dɪˈskʌvər/',
    meaning: '发现；发觉',
    status: 'learned',
  },
  {
    id: '5',
    word: 'Environment',
    pronunciation: '/ɪnˈvaɪrənmənt/',
    meaning: '环境；周围',
    status: 'learning',
  },
  {
    id: '6',
    word: 'Freedom',
    pronunciation: '/ˈfriːdəm/',
    meaning: '自由；自主',
    status: 'learned',
  },
  {
    id: '7',
    word: 'Gratitude',
    pronunciation: '/ˈɡrætɪtuːd/',
    meaning: '感激；感谢',
    status: 'new',
  },
  {
    id: '8',
    word: 'Happiness',
    pronunciation: '/ˈhæpinəs/',
    meaning: '幸福；快乐',
    status: 'learning',
  },
];

export const mockUser: User = {
  id: '1',
  name: 'Alex Chen',
  avatar: 'A',
  level: 5,
  stats: {
    totalWords: 127,
    todayNewWords: 23,
    consecutiveDays: 15,
    correctRate: 89,
    totalReviews: 156,
  },
};