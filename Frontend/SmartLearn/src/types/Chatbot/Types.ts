export interface ChatMessage {
  id?: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp?: string;
}

export interface ChatSession {
  id: number;
  lecture: number;
  messages: ChatMessage[];
}