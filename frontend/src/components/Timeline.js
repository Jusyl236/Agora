/**
 * Timeline - Affichage central des messages
 * Fond clair pour lisibilité (requis par Julien)
 */
import React, { useEffect, useRef } from 'react';
import { useCafe } from '../context/CafeContext';

const Timeline = () => {
  const { activeSession, STATE_COLORS, STATE_EMOJIS } = useCafe();
  const timelineEndRef = useRef(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  if (!activeSession) {
    return (
      <div className="flex-1 bg-gray-50 rounded-lg p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">☕ Café Virtuel - Agora</h2>
          <p className="text-gray-500 mb-6">Aucune session active</p>
          <p className="text-sm text-gray-400">Créez une nouvelle session pour commencer</p>
        </div>
      </div>
    );
  }

  const messages = activeSession.messages || [];

  return (
    <div className="flex-1 bg-gray-50 rounded-lg p-6 overflow-y-auto">
      {/* En-tête de session */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">
          Session {activeSession.config.session_number}: {activeSession.config.subject}
        </h2>
        <p className="text-sm text-gray-500 mt-1">{activeSession.config.summary}</p>
        <div className="flex gap-2 mt-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            activeSession.status === 'active' ? 'bg-green-100 text-green-700' :
            activeSession.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {activeSession.status}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {messages.map((msg, index) => {
          const fm = msg.formatted_message;
          const stateColor = STATE_COLORS[fm.state] || '#6b7280';
          const stateEmoji = STATE_EMOJIS[fm.state] || '⚪';

          return (
            <div
              key={msg.id || index}
              className="bg-white rounded-lg p-4 shadow-sm border-l-4 hover:shadow-md transition-shadow"
              style={{ borderLeftColor: stateColor }}
            >
              {/* En-tête du message */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{stateEmoji}</span>
                  <span className="font-bold text-gray-900">{fm.ia_name}</span>
                  {msg.is_human && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      👤 Julien (Le Barman)
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(fm.timestamp).toLocaleTimeString('fr-FR')}
                </span>
              </div>

              {/* Métadonnées */}
              <div className="flex gap-4 text-xs text-gray-600 mb-3">
                <span>🎭 {fm.role}</span>
                <span>☕ {fm.cafe_type}</span>
                <span style={{ color: stateColor }} className="font-medium">
                  {stateEmoji} {fm.state}
                </span>
              </div>

              {/* Contenu */}
              <div className="prose prose-sm max-w-none mb-3 text-gray-800 leading-relaxed whitespace-pre-wrap">
                {fm.content}
              </div>

              {/* Question pour la suite */}
              {fm.next_question && (
                <div className="bg-gray-50 rounded p-3 mb-3 border-l-2 border-blue-400">
                  <div className="text-xs text-gray-600 mb-1">→ [@ {fm.interlocutor}]</div>
                  <div className="text-sm text-gray-700 italic">"{fm.next_question}"</div>
                </div>
              )}

              {/* Signature */}
              <div className="text-right text-sm text-gray-500 italic">
                — {fm.signature}
              </div>

              {/* Questions détectées automatiquement */}
              {msg.detected_questions && msg.detected_questions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">❓ Questions détectées:</div>
                  <ul className="text-xs text-gray-600 mt-1 space-y-1">
                    {msg.detected_questions.map((q, i) => (
                      <li key={i}>• {q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Référence pour auto-scroll */}
      <div ref={timelineEndRef} />
    </div>
  );
};

export default Timeline;
