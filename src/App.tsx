import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card } from './components/ui/card';
import { VoiceAssistant } from './components/VoiceAssistant';
import { HandGestureDetector } from './components/HandGestureDetector';
import { ChatInterface } from './components/ChatInterface';
import { Dashboard } from './components/Dashboard';
import { Mic, Hand, MessageCircle, BarChart3 } from 'lucide-react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type: 'voice' | 'gesture' | 'text';
}

export interface InteractionStats {
  totalInteractions: number;
  gesturesRecognized: number;
  voiceCommands: number;
  averageResponseTime: number;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour! Je suis ton assistant virtuel. Tu peux me parler avec ta voix ou utiliser des gestes! 👋',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'text'
    }
  ]);

  const [stats, setStats] = useState<InteractionStats>({
    totalInteractions: 0,
    gesturesRecognized: 0,
    voiceCommands: 0,
    averageResponseTime: 0
  });

  const addMessage = (text: string, type: 'voice' | 'gesture' | 'text') => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      type
    };

    setMessages(prev => [...prev, userMessage]);

    // Update stats
    setStats(prev => ({
      ...prev,
      totalInteractions: prev.totalInteractions + 1,
      gesturesRecognized: type === 'gesture' ? prev.gesturesRecognized + 1 : prev.gesturesRecognized,
      voiceCommands: type === 'voice' ? prev.voiceCommands + 1 : prev.voiceCommands
    }));

    // Generate response
    setTimeout(() => {
      const response = generateResponse(text);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response
      speakText(response);
    }, 500);
  };

  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    // Educational responses for children
    if (lowerInput.includes('bonjour') || lowerInput.includes('salut') || lowerInput.includes('hello')) {
      return 'Bonjour! Comment puis-je t\'aider aujourd\'hui? 😊';
    }
    
    if (lowerInput.includes('temps') || lowerInput.includes('météo')) {
      return 'Il fait beau aujourd\'hui! Le soleil brille! ☀️ C\'est parfait pour jouer dehors!';
    }

    if (lowerInput.includes('couleur') || lowerInput.includes('rouge') || lowerInput.includes('bleu')) {
      return 'Les couleurs sont magnifiques! Rouge comme une pomme 🍎, bleu comme le ciel 🌤️, jaune comme le soleil ☀️!';
    }

    if (lowerInput.includes('compter') || lowerInput.includes('nombre')) {
      return 'Comptons ensemble! 1, 2, 3, 4, 5! 🎵 Tu es super!';
    }

    if (lowerInput.includes('animal') || lowerInput.includes('chat') || lowerInput.includes('chien')) {
      return 'J\'adore les animaux! Les chats font "miaou" 🐱 et les chiens font "ouaf" 🐕!';
    }

    if (lowerInput.includes('merci')) {
      return 'De rien! Je suis toujours là pour t\'aider! 💙';
    }

    if (lowerInput.includes('pouce levé') || lowerInput.includes('👍')) {
      return 'Super! Continue comme ça! Tu es génial! 🌟';
    }

    if (lowerInput.includes('victoire') || lowerInput.includes('✌️')) {
      return 'Victoire! Bravo champion! 🏆';
    }

    if (lowerInput.includes('stop') || lowerInput.includes('✋')) {
      return 'D\'accord, je m\'arrête! Dis-moi quand tu es prêt! 🤚';
    }

    if (lowerInput.includes('apprendre') || lowerInput.includes('éducation')) {
      return 'J\'adore apprendre! On peut apprendre les couleurs, les nombres, les animaux... Que veux-tu apprendre? 📚';
    }

    return 'C\'est intéressant! Raconte-moi en plus! 😊 Tu peux aussi essayer de me parler avec ta voix ou tes gestes!';
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 pt-6">
          <h1 className="text-purple-600 mb-2">
            Assistant Virtuel Multimodal
          </h1>
          <p className="text-gray-600">
            Parle avec ta voix ou utilise tes gestes! 🎉
          </p>
        </header>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Voix
            </TabsTrigger>
            <TabsTrigger value="gesture" className="flex items-center gap-2">
              <Hand className="w-4 h-4" />
              Gestes
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card className="p-6">
              <ChatInterface messages={messages} onSendMessage={(text) => addMessage(text, 'text')} />
            </Card>
          </TabsContent>

          <TabsContent value="voice">
            <Card className="p-6">
              <VoiceAssistant messages={messages} onVoiceCommand={(text) => addMessage(text, 'voice')} />
            </Card>
          </TabsContent>

          <TabsContent value="gesture">
            <Card className="p-6">
              <HandGestureDetector onGestureDetected={(gesture) => addMessage(gesture, 'gesture')} />
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Dashboard stats={stats} messages={messages} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
