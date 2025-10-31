import { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Camera, CameraOff, Hand, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Hands } from '@mediapipe/hands';
import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

interface HandGestureDetectorProps {
  onGestureDetected: (gesture: string) => void;
}

export function HandGestureDetector({ onGestureDetected }: HandGestureDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'active' | 'error'>('idle');
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<MediaPipeCamera | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const recognizeGesture = (landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return '';

    // Simple gesture recognition based on finger positions
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const thumbIP = landmarks[3];
    const indexDIP = landmarks[7];
    const middleDIP = landmarks[11];
    const ringDIP = landmarks[15];
    const pinkyDIP = landmarks[19];

    // Thumbs up: thumb extended, other fingers curled
    if (thumbTip.y < thumbIP.y &&
        indexTip.y > indexDIP.y &&
        middleTip.y > middleDIP.y &&
        ringTip.y > ringDIP.y &&
        pinkyTip.y > pinkyDIP.y) {
      return '👍 Pouce levé';
    }

    // Peace sign: index and middle extended, others curled
    if (indexTip.y < indexDIP.y &&
        middleTip.y < middleDIP.y &&
        ringTip.y > ringDIP.y &&
        pinkyTip.y > pinkyDIP.y) {
      return '✌️ Victoire';
    }

    // OK sign: thumb and index touching, others extended
    if (Math.abs(thumbTip.x - indexTip.x) < 0.05 &&
        Math.abs(thumbTip.y - indexTip.y) < 0.05 &&
        middleTip.y < middleDIP.y &&
        ringTip.y < ringDIP.y &&
        pinkyTip.y < pinkyDIP.y) {
      return '👌 OK';
    }

    // Stop sign: all fingers extended
    if (indexTip.y < indexDIP.y &&
        middleTip.y < middleDIP.y &&
        ringTip.y < ringDIP.y &&
        pinkyTip.y < pinkyDIP.y) {
      return '✋ Stop';
    }

    return '';
  };

  const onResults = (results: any) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw video frame
    canvasCtx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const landmarks of results.multiHandLandmarks) {
        // Draw hand landmarks
        drawConnectors(canvasCtx, landmarks, (Hands as any).HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 5
        });
        drawLandmarks(canvasCtx, landmarks, {
          color: '#FF0000',
          lineWidth: 2
        });

        // Recognize gesture
        const gesture = recognizeGesture(landmarks);
        if (gesture && gesture !== detectedGesture) {
          setDetectedGesture(gesture);
          onGestureDetected(gesture);
        }
      }
    }

    canvasCtx.restore();
  };

  const startCamera = async () => {
    setIsLoading(true);
    setError('');
    setCameraStatus('idle');

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Ton navigateur ne supporte pas l\'accès à la caméra. Essaie Chrome, Firefox ou Safari.');
      setCameraStatus('error');
      setIsLoading(false);
      return;
    }

    try {
      // Request camera access with simplified constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setIsActive(true);
                setCameraStatus('active');
                setError('');
                setIsLoading(false);

                // Initialize MediaPipe Hands
                const hands = new Hands({
                  locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                  }
                });

                hands.setOptions({
                  maxNumHands: 2,
                  modelComplexity: 1,
                  minDetectionConfidence: 0.5,
                  minTrackingConfidence: 0.5
                });

                hands.onResults(onResults);
                handsRef.current = hands;

                // Initialize camera
                const camera = new MediaPipeCamera(videoRef.current, {
                  onFrame: async () => {
                    if (handsRef.current) {
                      await handsRef.current.send({ image: videoRef.current! });
                    }
                  },
                  width: 640,
                  height: 480
                });

                camera.start();
                cameraRef.current = camera;
              })
              .catch((playErr: any) => {
                console.error('Video play error:', playErr);
                setError('Erreur lors du démarrage de la vidéo. Réessaie!');
                setCameraStatus('error');
                setIsLoading(false);
                stopCamera();
              });
          }
        };

        // Timeout fallback
        setTimeout(() => {
          if (isLoading) {
            setIsLoading(false);
            if (!isActive) {
              setError('La caméra met trop de temps à démarrer. Réessaie!');
              stopCamera();
            }
          }
        }, 5000);
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraStatus('error');
      setIsLoading(false);
      
      // Provide specific error messages
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Permission refusée. Clique sur l\'icône 📷 dans la barre d\'adresse et autorise l\'accès à la caméra.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('Aucune caméra trouvée. Assure-toi qu\'une caméra est connectée à ton appareil.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('La caméra est utilisée par une autre application. Ferme les autres applications qui utilisent la caméra.');
      } else if (err.name === 'OverconstrainedError') {
        setError('Les paramètres de la caméra ne sont pas supportés. Essaie une autre caméra.');
      } else if (err.name === 'SecurityError') {
        setError('Erreur de sécurité. Assure-toi que la page est en HTTPS ou sur localhost.');
      } else if (err.name === 'TypeError') {
        setError('Erreur de configuration. Ton navigateur ne supporte peut-être pas cette fonctionnalité.');
      } else {
        setError(`Erreur: ${err.message || 'Impossible d\'accéder à la caméra.'}`);
      }
    }
  };

  const stopCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }

    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setCameraStatus('idle');
    setDetectedGesture('');
  };

  const simulateGesture = (gesture: string, emoji: string, description: string) => {
    setDetectedGesture(`${emoji} ${gesture}`);
    onGestureDetected(`${emoji} ${description}`);
    
    // Clear after animation
    setTimeout(() => {
      setDetectedGesture('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-purple-600 mb-2">✋ Détection de Gestes</h2>
        <p className="text-gray-600">Utilise tes mains pour communiquer!</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="mb-2">{error}</p>
            <div className="mt-3 text-sm">
              <p className="mb-2">💡 <strong>Solutions:</strong></p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Clique sur l'icône 📷 dans la barre d'adresse de ton navigateur</li>
                <li>Sélectionne "Toujours autoriser" pour ce site</li>
                <li>Recharge la page si nécessaire</li>
                <li>Utilise le <strong>mode démo</strong> ci-dessous (pas besoin de caméra!) 👇</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {cameraStatus === 'active' && !error && (
        <Alert className="bg-green-50 border-green-300">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            ✅ Caméra activée avec succès! Tu peux te voir à l'écran.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center">
      <div className="relative w-full max-w-[640px]">
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className={`w-full rounded-lg border-4 ${
              isActive ? 'border-green-400' : 'border-purple-300'
            } ${isActive ? 'block' : 'hidden'}`}
            style={{ maxHeight: '480px' }}
          />
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="hidden"
          />
          {!isActive && (
            <div className="w-full aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg border-4 border-purple-300 flex items-center justify-center">
              <div className="text-center p-8">
                <Camera className="w-20 h-20 mx-auto mb-4 text-purple-400" />
                <p className="text-purple-600 mb-2">Caméra désactivée</p>
                <p className="text-gray-500">Clique sur "Activer" pour commencer</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {detectedGesture && (
        <div className="animate-bounce">
          <Card className="bg-green-50 border-2 border-green-400 p-6 text-center">
            <p className="text-green-700 text-2xl">
              Geste détecté: {detectedGesture}
            </p>
          </Card>
        </div>
      )}

      <div className="flex justify-center gap-4">
        {!isActive ? (
          <Button
            onClick={startCamera}
            disabled={isLoading}
            size="lg"
            className="bg-purple-500 hover:bg-purple-600 px-8"
          >
            <Camera className="w-5 h-5 mr-2" />
            {isLoading ? 'Chargement...' : 'Activer la Caméra'}
          </Button>
        ) : (
          <Button
            onClick={stopCamera}
            size="lg"
            variant="destructive"
            className="px-8"
          >
            <CameraOff className="w-5 h-5 mr-2" />
            Désactiver
          </Button>
        )}
      </div>

      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-purple-700 flex items-center gap-2">
            <Hand className="w-6 h-6" />
            Mode Démo - Gestes Interactifs
          </h3>
          <span className="bg-purple-200 text-purple-700 px-3 py-1 rounded-full text-sm">
            Pas besoin de caméra!
          </span>
        </div>
        
        <p className="text-gray-600 mb-4">
          {isActive 
            ? '✨ Caméra active! Clique aussi sur ces gestes pour les tester:'
            : '🎯 Clique sur un geste pour l\'essayer immédiatement:'
          }
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { gesture: 'Pouce levé', emoji: '👍', desc: 'Pouce levé - Super!' },
            { gesture: 'Victoire', emoji: '✌️', desc: 'Victoire - Bravo!' },
            { gesture: 'Stop', emoji: '✋', desc: 'Stop - D\'accord!' },
            { gesture: 'OK', emoji: '👌', desc: 'OK - Parfait!' },
            { gesture: 'Bonjour', emoji: '👋', desc: 'Bonjour - Salut!' },
            { gesture: 'Cœur', emoji: '❤️', desc: 'Cœur - Je t\'aime!' }
          ].map((item, index) => (
            <Button
              key={index}
              onClick={() => simulateGesture(item.gesture, item.emoji, item.desc)}
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-3 border-2 border-purple-300 hover:bg-purple-100 hover:border-purple-400 transition-all hover:scale-105"
            >
              <span className="text-5xl">{item.emoji}</span>
              <span className="text-gray-700">{item.gesture}</span>
            </Button>
          ))}
        </div>
      </Card>

      <Alert className="bg-blue-50 border-blue-300">
        <AlertDescription>
          <p className="mb-3">💡 <strong>Comment ça marche?</strong></p>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>🎮 Mode Démo (Recommandé):</strong> Clique simplement sur les boutons de gestes ci-dessus. 
              Aucune caméra nécessaire! C'est parfait pour apprendre et s'amuser! 🎉
            </p>
            <p>
              <strong>📹 Mode Caméra:</strong> Active la caméra pour te voir à l'écran. Pour une vraie détection 
              automatique de gestes, il faudrait intégrer MediaPipe Hands ou TensorFlow.js (librairies de machine learning).
            </p>
            <p className="mt-3 text-purple-700">
              ⭐ <strong>Astuce:</strong> Le mode démo est super pour apprendre! Essaie tous les gestes!
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
