import { Card } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Activity, MessageCircle, Mic, Hand, Clock } from 'lucide-react';
import type { InteractionStats, Message } from '../App';

interface DashboardProps {
  stats: InteractionStats;
  messages: Message[];
}

export function Dashboard({ stats, messages }: DashboardProps) {
  const interactionTypeData = [
    { name: 'Texte', value: messages.filter(m => m.type === 'text' && m.sender === 'user').length },
    { name: 'Voix', value: stats.voiceCommands },
    { name: 'Gestes', value: stats.gesturesRecognized }
  ];

  const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899'];

  const messagesByHour = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const count = messages.filter(m => {
      const messageHour = m.timestamp.getHours();
      return messageHour === hour && m.sender === 'user';
    }).length;
    return { hour: `${hour}h`, count };
  }).filter(item => item.count > 0);

  const recentActivity = messages
    .slice(-10)
    .reverse()
    .map(m => ({
      time: m.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      type: m.type,
      sender: m.sender,
      preview: m.text.substring(0, 50) + (m.text.length > 50 ? '...' : '')
    }));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-purple-600 mb-2">📊 Tableau de Bord</h2>
        <p className="text-gray-600">Visualise tes interactions avec l'assistant</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Total Interactions</p>
              <p className="text-purple-700">{stats.totalInteractions}</p>
            </div>
            <Activity className="w-12 h-12 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Commandes Vocales</p>
              <p className="text-blue-700">{stats.voiceCommands}</p>
            </div>
            <Mic className="w-12 h-12 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Gestes Reconnus</p>
              <p className="text-pink-700">{stats.gesturesRecognized}</p>
            </div>
            <Hand className="w-12 h-12 text-pink-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Messages</p>
              <p className="text-green-700">{messages.length}</p>
            </div>
            <MessageCircle className="w-12 h-12 text-green-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="mb-4 text-purple-700">Types d'Interactions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={interactionTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {interactionTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-purple-700">Interactions par Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={interactionTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {messagesByHour.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-purple-700">Activité par Heure</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={messagesByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="mb-4 text-purple-700 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Activité Récente
        </h3>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune activité pour le moment</p>
          ) : (
            recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200"
              >
                <div className="flex-shrink-0">
                  {activity.type === 'voice' && <Mic className="w-5 h-5 text-blue-500" />}
                  {activity.type === 'gesture' && <Hand className="w-5 h-5 text-pink-500" />}
                  {activity.type === 'text' && <MessageCircle className="w-5 h-5 text-purple-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-600">
                      {activity.sender === 'user' ? 'Toi' : '🤖 Assistant'}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">{activity.time}</span>
                  </div>
                  <p className="text-gray-700 truncate">{activity.preview}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
        <h3 className="mb-4 text-purple-700">🎉 Encouragements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.totalInteractions >= 10 && (
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">🌟</div>
              <p className="text-gray-700">Explorateur!</p>
              <p className="text-gray-500">10+ interactions</p>
            </div>
          )}
          {stats.voiceCommands >= 5 && (
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">🎤</div>
              <p className="text-gray-700">Champion de la Voix!</p>
              <p className="text-gray-500">5+ commandes vocales</p>
            </div>
          )}
          {stats.gesturesRecognized >= 5 && (
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">✋</div>
              <p className="text-gray-700">Expert des Gestes!</p>
              <p className="text-gray-500">5+ gestes reconnus</p>
            </div>
          )}
          {stats.totalInteractions === 0 && (
            <div className="bg-white rounded-lg p-4 text-center col-span-3">
              <div className="text-4xl mb-2">👋</div>
              <p className="text-gray-700">Bienvenue!</p>
              <p className="text-gray-500">Commence à interagir avec l'assistant pour débloquer des badges!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
