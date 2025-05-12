export interface User {
  name: string;
  avatar: string;
  isBot?: boolean;
}

export enum MessageType {
  NORMAL = 'normal',
  QUESTION = 'question',
  ANSWER = 'answer',
  SYSTEM = 'system'
}

export enum Command {
  ASK = '/ask',
  ANSWER = '/answer',
  SEARCH = '/search'
}

export interface Message {
  id: string;
  type: MessageType;
  user: User;
  content: string;
  timestamp: string;
  threadTs?: string;
  reactions?: Reaction[];
}

export interface Reaction {
  name: string;
  count: number;
  users: string[];
}

export interface Question {
  id: string;
  title: string;
  body: string;
  author: User;
  timestamp: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  answers: Answer[];
  isResolved: boolean;
}

export interface Answer {
  id: string;
  body: string;
  author: User;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
}