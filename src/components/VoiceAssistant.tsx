import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import type { Message } from '../App';

interface VoiceAssistantProps {
  messages: Message[];
  onVoiceCommand: (text: string) => void;
}

export function VoiceAssistant({ messages, onVoiceCommand }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Changed to false for better reliability
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
      setHasPermission(true);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);
      
      if (final) {
        onVoiceCommand(final.trim());
        setInterimTranscript('');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setError('Permission du microphone refusée. Clique sur l\'icône 🎤 dans la barre d\'adresse et autorise le microphone.');
        setHasPermission(false);
      } else if (event.error === 'no-speech') {
        setError('Aucune parole détectée. Parle plus fort ou rapproche-toi du microphone!');
      } else if (event.error === 'audio-capture') {
        setError('Aucun microphone trouvé. Vérifie qu\'un microphone est connecté.');
      } else if (event.error === 'network') {
        setError('Erreur réseau. Vérifie ta connexion Internet.');
      } else {
        setError(`Erreur: ${event.error}. Réessaie!`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [onVoiceCommand]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    try {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
        setInterimTranscript('');
      } else {
        setError('');
        recognitionRef.current.start();
      }
    } catch (err: any) {
      console.error('Toggle listening error:', err);
      setError('Erreur lors du démarrage. Attends quelques secondes et réessaie!');
      setIsListening(false);
    }
  };

  const testVoice = () => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance('Bonjour! Je peux te parler et t\'écouter!');
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      
      window.speechSynthesis.speak(utterance);
    } else {
      setError('La synthèse vocale n\'est pas supportée sur ton navigateur.');
    }
  };

  const quickTest = () => {
    const testPhrases = [
      'Bonjour',
      'Quel temps fait-il?',
      'Parle-moi des couleurs',
      'Compte avec moi'
    ];
    const randomPhrase = testPhrases[Math.floor(Math.random() * testPhrases.length)];
    onVoiceCommand(randomPhrase);
  };

  if (!isSupported) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <MicOff className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-gray-600 mb-2">Reconnaissance vocale non supportée</h3>
          <p className="text-gray-500 mb-4">
            Ton navigateur ne supporte pas la reconnaissance vocale.
          </p>
          <p className="text-gray-500">
            ✅ Chrome • ✅ Edge • ✅ Safari (iOS 14.5+)
          </p>
        </div>
        
        <Card className="bg-blue-50 border-2 border-blue-200 p-4">
          <h3 className="mb-3 text-blue-700">💡 Pas de problème!</h3>
          <p className="text-gray-700 mb-3">
            Tu peux quand même utiliser l'assistant:
          </p>
          <Button onClick={quickTest} className="w-full bg-purple-500 hover:bg-purple-600">
            Tester l'assistant (Mode Texte)
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-purple-600 mb-2">🎤 Assistant Vocal</h2>
        <p className="text-gray-600">Clique sur le microphone et parle!</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="mb-2">{error}</p>
            {hasPermission === false && (
              <ul className="text-sm list-disc ml-5 mt-2">
                <li>Clique sur l'icône 🎤 dans la barre d'adresse</li>
                <li>Sélectionne "Toujours autoriser"</li>
                <li>Recharge la page si nécessaire</li>
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center gap-4">
        <div className="text-center">
          <Button
            onClick={toggleListening}
            size="lg"
            className={`w-32 h-32 rounded-full ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-purple-500 hover:bg-purple-600'
            }`}
          >
            {isListening ? (
              <Mic className="w-16 h-16" />
            ) : (
              <MicOff className="w-16 h-16" />
            )}
          </Button>
          <p className="mt-2 text-gray-600">
            {isListening ? 'Arrêter' : 'Écouter'}
          </p>
        </div>

        <div className="text-center">
          <Button
            onClick={testVoice}
            size="lg"
            variant="outline"
            className="w-32 h-32 rounded-full border-2 border-purple-300 hover:bg-purple-50"
          >
            <Volume2 className="w-16 h-16 text-purple-500" />
          </Button>
          <p className="mt-2 text-gray-600">Test Audio</p>
        </div>
      </div>

      <div className="text-center min-h-[60px] flex items-center justify-center">
        {isListening ? (
          <div>
            <p className="text-green-600 mb-2">
              🎙️ J'écoute... Parle maintenant!
            </p>
            {interimTranscript && (
              <p className="text-purple-600 italic">
                "{interimTranscript}"
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-600">
            Clique sur le microphone 🎤 pour commencer
          </p>
        )}
      </div>

      <Card className="bg-purple-50 border-2 border-purple-200 p-4">
        <h3 className="mb-3 text-purple-700">💡 Essaie de dire:</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { emoji: '🌞', text: 'Quel temps fait-il?' },
            { emoji: '🎨', text: 'Parle-moi des couleurs' },
            { emoji: '🔢', text: 'Compte avec moi' },
            { emoji: '🐱', text: 'Parle-moi des animaux' },
            { emoji: '📚', text: 'Je veux apprendre' },
            { emoji: '👋', text: 'Bonjour' }
          ].map((suggestion, index) => (
            <Button
              key={index}
              onClick={() => onVoiceCommand(suggestion.text)}
              variant="outline"
              className="h-auto py-3 bg-white hover:bg-purple-100 border-purple-200 justify-start"
            >
              <span className="mr-2">{suggestion.emoji}</span>
              <span>"{suggestion.text}"</span>
            </Button>
          ))}
        </div>
      </Card>

      <div>
        <h3 className="mb-3 text-purple-700">📝 Conversation récente:</h3>
        <div className="h-[200px] rounded-lg border-2 border-purple-200 p-4 bg-white overflow-y-auto" ref={scrollRef}>
          {messages.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Commence à parler pour voir la conversation ici!</p>
          ) : (
            <div className="space-y-2">
              {messages.slice(-5).map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-purple-100 text-right ml-8'
                      : 'bg-blue-50 text-left mr-8'
                  }`}
                >
                  <p className="text-gray-800">{message.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription>
          <p className="mb-2">💡 <strong>Astuces pour une meilleure reconnaissance:</strong></p>
          <ul className="list-disc ml-5 space-y-1 text-sm">
            <li>Parle clairement et pas trop vite</li>
            <li>Assure-toi d'être dans un endroit calme</li>
            <li>Rapproche-toi du microphone si nécessaire</li>
            <li>Clique sur une suggestion si la reconnaissance ne marche pas</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
