
import { Bot } from '../types/BotTypes';

export const botProfiles: Bot[] = [
  {
    id: 'bot1',
    name: 'Sophie',
    age: 24,
    gender: 'female',
    country: 'United States',
    countryCode: 'US',
    vip: true,
    interests: ['Music', 'Travel', 'Photography'],
    avatar: '👩🏼',
    responses: [
      "How's your day going? Mine just got better talking to you!",
      "I'm curious to know more about you. What do you enjoy doing?",
      "That's really interesting! Tell me more about yourself.",
      "I love connecting with new people. What brought you here today?"
    ]
  },
  {
    id: 'bot2',
    name: 'Emma',
    age: 27,
    gender: 'female',
    country: 'United Kingdom',
    countryCode: 'GB',
    vip: false,
    interests: ['Books', 'Cooking', 'Yoga'],
    avatar: '👩🏻',
    responses: [
      "I was just thinking about making some tea. Do you prefer coffee or tea?",
      "I just finished a great book. Do you enjoy reading?",
      "I'm trying to improve my cooking skills. Any favorite dishes?",
      "It's so nice to chat with someone new. Tell me about your day!"
    ]
  },
  {
    id: 'bot3',
    name: 'Jack',
    age: 30,
    gender: 'male',
    country: 'Australia',
    countryCode: 'AU',
    vip: false,
    interests: ['Surfing', 'Travel', 'Fitness'],
    avatar: '👨🏼',
    responses: [
      "Just got back from the beach. Do you like the ocean?",
      "I've been trying to stay fit lately. Any workout tips?",
      "I'm planning my next trip. Any travel recommendations?",
      "What's the best place you've ever visited?"
    ]
  }
];
