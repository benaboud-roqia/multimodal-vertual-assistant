Multimodal Virtual Assistant
Un assistant virtuel interactif conçu pour les enfants, permettant l'interaction via la voix, les gestes des mains et le texte. Idéal pour l'apprentissage ludique et l'éducation.

Fonctionnalités
Interface Chat : Conversation textuelle avec l'assistant
Reconnaissance Vocale : Commandes vocales en français
Détection de Gestes : Reconnaissance des gestes des mains (pouce levé, victoire, stop, etc.)
Réponses Éducatives : Apprentissage des couleurs, nombres, animaux, etc.
Synthèse Vocale : L'assistant parle les réponses
Tableau de Bord : Statistiques des interactions
Interface Adaptée aux Enfants : Design coloré et intuitif
Technologies Utilisées
Frontend : React 18 avec TypeScript
Build Tool : Vite
UI Components : Radix UI, Tailwind CSS
Reconnaissance de Gestes : MediaPipe Hands
Icônes : Lucide React
Charts : Recharts
Thèmes : next-themes
Installation
Cloner le repository :



git clone <url-du-repo>
cd multimodal-virtual-assistant
Installer les dépendances :


npm install
Lancer l'application en mode développement :


npm run dev
Ouvrir http://localhost:5173 dans votre navigateur.

Utilisation
Chat : Tapez vos messages dans l'interface de chat
Voix : Cliquez sur le bouton microphone et parlez
Gestes : Placez votre main devant la caméra pour les gestes
Statistiques : Consultez vos interactions dans l'onglet Statistiques
Gestes Supportés
👍 Pouce levé
✌️ Victoire
✋ Stop
Structure du Projet

src/
├── components/
│   ├── ChatInterface.tsx      # Interface de chat
│   ├── VoiceAssistant.tsx     # Assistant vocal
│   ├── HandGestureDetector.tsx # Détection de gestes
│   ├── Dashboard.tsx          # Tableau de bord
│   └── ui/                    # Composants UI réutilisables
├── App.tsx                    # Composant principal
└── main.tsx                   # Point d'entrée
Scripts Disponibles
npm run dev : Lance le serveur de développement
npm run build : Construit l'application pour la production
Navigateurs Supportés
Chrome/Chromium (recommandé pour la reconnaissance de gestes)
Firefox
Safari
Edge
Contribution
Les contributions sont les bienvenues ! Veuillez créer une issue ou une pull request.
<img width="3455" height="1967" alt="image" src="https://github.com/user-attachments/assets/b430deab-4525-4a76-a8d3-b92891e3b69a" />
<img width="3455" height="1845" alt="image" src="https://github.com/user-attachments/assets/3a49e4b1-6472-41b2-890c-1894ada4f0f5" />
<img width="3455" height="1965" alt="image" src="https://github.com/user-attachments/assets/aeaa4dac-a4de-4a95-a0df-6672106b83c0" />
<img width="960" height="1280" alt="image" src="https://github.com/user-attachments/assets/71d4598f-d754-493c-a5e5-858c76f30e2e" />
<img width="960" height="1280" alt="image" src="https://github.com/user-attachments/assets/7310d115-b868-4930-99b0-45786f14aff5" />



faites par benaboud roqia etudiante en master IA&SD


Licence
Ce projet est sous licence MIT.
