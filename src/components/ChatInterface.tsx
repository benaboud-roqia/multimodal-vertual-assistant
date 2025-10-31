import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Mic, Hand } from 'lucide-react';
import type { Message } from '../App';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export function ChatInterface({ messages, onSendMessage }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'voice':
        return <Mic className="w-3 h-3" />;
      case 'gesture':
        return <Hand className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="mb-4">
        <h2 className="text-purple-600 mb-2">💬 Discussion avec l'Assistant</h2>
        <p className="text-gray-600">Écris tes messages ici ou utilise les onglets Voix et Gestes!</p>
      </div>

      <div className="flex-1 pr-4 mb-4 overflow-y-auto rounded-md border border-purple-200" ref={scrollRef}>
        <div className="space-y-4 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white border-2 border-purple-200 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.sender === 'user' && getMessageIcon(message.type)}
                  <span className="opacity-70">
                    {message.sender === 'user' ? 'Toi' : '🤖 Assistant'}
                  </span>
                </div>
                <p>{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Écris ton message ici..."
          className="flex-1 border-2 border-purple-200 focus:border-purple-400"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-purple-500 hover:bg-purple-600"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
