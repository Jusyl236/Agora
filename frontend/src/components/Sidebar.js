/**
 * Sidebar.js – Barre latérale modulaire du Café Virtuel
 * -----------------------------------------------------
 * Ce fichier exporte 5 composants React :
 *  1. AlertsPanel     : suggestions Sommelier + moments Oracle
 *  2. StatsPanel      : stats messages, états Mem4Ristor, cafés servis
 *  3. QuestionsPanel  : questions détectées dans les réponses des IAs
 *  4. ExportsPanel    : export local, GitHub, e-mail
 *  5. DebugURLPanel   : 🐛 saisie manuelle des URLs des conversations
 *
 * Utilisation :
 *   import { AlertsPanel, StatsPanel, QuestionsPanel, ExportsPanel, DebugURLPanel } from './Sidebar';
 *   Puis dans votre JSX :
 *   <AlertsPanel />
 *   <StatsPanel />
 *   ...
 */

import React, { useState, useEffect } from 'react';
import { useCafe } from '../context/CafeContext';
import { cafeApi } from '../services/cafeApi';
// ↑ Hook global et service API déjà configurés

/* ------------------------------------------------------------------ */
/* 1. ALERTES – Suggestions Sommelier + moments Oracle                */
/* ------------------------------------------------------------------ */
export const AlertsPanel = () => {
  const { activeSession, suggestion, acceptSuggestion, rejectSuggestion, STATE_EMOJIS } = useCafe();

  // Pas de session active → on n’affiche rien
  if (!activeSession) return null;

  // Messages marqués "Oracle" (breakthrough rare)
  const oracleMessages = activeSession.messages?.filter(
    m => m.formatted_message && m.formatted_message.state === 'oracle'
  ) || [];

  return (
    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        🔔 Alertes & Suggestions
      </h3>

      {/* Suggestion du mode Sommelier */}
      {suggestion && (
        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-3 mb-3 animate-pulse">
          <div className="text-sm font-medium text-purple-900 mb-2">
            💡 {suggestion.message}
          </div>
          {suggestion.reason && (
            <div className="text-xs text-purple-700 mb-3">
              {suggestion.reason}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={acceptSuggestion}
              className="flex-1 py-1 px-2 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700"
            >
              ✓ Accepter
            </button>
            <button
              onClick={rejectSuggestion}
              className="flex-1 py-1 px-2 bg-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-400"
            >
              ✗ Refuser
            </button>
          </div>
        </div>
      )}

      {/* Moments Oracle (breakthrough) */}
      {oracleMessages.length > 0 && (
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-700 mb-2">
            🔮 Moments Oracle ({oracleMessages.length})
          </div>
          <div className="space-y-2">
            {oracleMessages.slice(-3).map((msg, i) => (
              <div key={i} className="bg-purple-50 rounded p-2 text-xs">
                <div className="font-medium text-purple-900">
                  {msg.formatted_message?.ia_name || msg.from_ia}
                </div>
                <div className="text-purple-700 truncate">
                  {msg.formatted_message?.content?.substring(0, 50) || msg.raw_content.substring(0, 50)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* État de la session (active/pause) */}
      <div className="text-xs text-gray-500">
        Session {activeSession.status === 'active' ? '🟢 Active' : '⏸️ En pause'}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 2. STATS – Messages, états Mem4Ristor, cafés servis, durée         */
/* ------------------------------------------------------------------ */
export const StatsPanel = () => {
  const { activeSession, STATE_EMOJIS } = useCafe();
  const [stats, setStats] = useState(null);

  // Récupère les stats dès que la session ou ses messages changent
  useEffect(() => {
    if (activeSession) {
      cafeApi.getSessionStats(activeSession.id)
        .then(setStats)
        .catch(console.error);
    }
  }, [activeSession?.messages?.length]);

  if (!activeSession || !stats) return null;

  return (
    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        📊 Statistiques
      </h3>

      <div className="space-y-3">
        {/* Total messages */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Messages</span>
          <span className="font-bold text-gray-900">{stats.total_messages}</span>
        </div>

        {/* Messages par IA */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">Par IA :</div>
          <div className="space-y-1">
            {Object.entries(stats.messages_per_ia).map(([ia, count]) => (
              <div key={ia} className="flex justify-between text-xs">
                <span className="text-gray-600">{ia}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition des états Mem4Ristor */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">États :</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stats.states_distribution).map(([state, count]) => (
              <div key={state} className="text-xs">
                <span className="mr-1">{STATE_EMOJIS[state]}</span>
                <span className="text-gray-900 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cafés servis */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">Cafés servis :</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>☕ Expresso</span>
              <span className="font-medium">{stats.cafes_served.expresso}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>☕ Long</span>
              <span className="font-medium">{stats.cafes_served.long}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>☕ Cosmique</span>
              <span className="font-medium">{stats.cafes_served.cosmique}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>🍰 Gourmand</span>
              <span className="font-medium">{stats.cafes_served.gourmand}</span>
            </div>
          </div>
        </div>

        {/* Durée de la session */}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm text-gray-600">Durée</span>
          <span className="font-bold text-gray-900">
            {Math.round(stats.duration_minutes)} min
          </span>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 3. QUESTIONS – Questions détectées dans les messages des IAs       */
/* ------------------------------------------------------------------ */
export const QuestionsPanel = () => {
  const { activeSession } = useCafe();

  if (!activeSession) return null;

  // Filtre les messages qui ont une ou plusieurs questions détectées
  const messagesWithQuestions = activeSession.messages?.filter(
    m => m.detected_questions && m.detected_questions.length > 0
  ) || [];

  return (
    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        ❓ Questions détectées
      </h3>

      {messagesWithQuestions.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-4">
          Aucune question détectée
        </div>
      ) : (
        <div className="space-y-3">
          {messagesWithQuestions.slice(-5).map((msg, i) => (
            <div key={i} className="bg-blue-50 rounded p-3 text-sm">
              <div className="font-medium text-blue-900 mb-1">
                De : {msg.formatted_message.ia_name}
              </div>
              <div className="text-blue-700 text-xs">
                {msg.detected_questions[0]}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 4. EXPORTS – Local, GitHub, Email                                  */
/* ------------------------------------------------------------------ */
export const ExportsPanel = () => {
  const { activeSession, exportSession } = useCafe();
  const [exporting, setExporting] = useState(false);

  // Appelle le service d’export (local, github ou email)
  const handleExport = async (format, formats = ['markdown', 'json']) => {
    setExporting(true);
    try {
      const result = await exportSession(format, formats);
      alert(`✅ Export réussi !\n${JSON.stringify(result, null, 2)}`);
    } catch (err) {
      alert(`❌ Erreur : ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  if (!activeSession) return null;

  return (
    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        💾 Exports
      </h3>

      <div className="space-y-2">
        <button
          onClick={() => handleExport('local', ['markdown', 'json'])}
          disabled={exporting}
          className="w-full py-2 px-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-50 transition-colors"
        >
          💻 Sauvegarder localement
        </button>

        <button
          onClick={() => handleExport('github')}
          disabled={exporting}
          className="w-full py-2 px-3 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors"
        >
          🐙 Exporter sur GitHub
        </button>

        <button
          onClick={() => handleExport('email')}
          disabled={exporting}
          className="w-full py-2 px-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
        >
          📧 Envoyer par email
        </button>
      </div>

      {exporting && (
        <div className="mt-3 text-xs text-center text-gray-500">
          ⏳ Export en cours...
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 5. DEBUG URL – Saisie manuelle des URLs de conversation            */
/* ------------------------------------------------------------------ */
export const DebugURLPanel = () => {
  const { currentSession } = useCafe();
  const [urls, setUrls] = useState({
    "ChatGPT": "",
    "Claude": "",
    "Mistral": "",
    "Grok": "",
    "DeepSeek": "",
    "Gemini": "",
    "Perplexity": "",
    "QWEN": "",
    "Manus AI": "",
    "Kimi": ""
  });

  // Met à jour l’état local + log dans la console
  const handleUrlChange = (iaName, url) => {
    setUrls(prev => ({ ...prev, [iaName]: url }));
    console.log(`📍 URL mise à jour pour ${iaName} : ${url}`);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        🐛 DEBUG - URLs des Conversations
      </h3>

      {messagesWithQuestions.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-4">
          Aucune question détectée
        </div>
      ) : (
        <div className="space-y-3">
          {messagesWithQuestions.slice(-5).map((msg, i) => (
            <div key={i} className="bg-blue-50 rounded p-3 text-sm">
              <div className="font-medium text-blue-900 mb-1">
                De: {msg.formatted_message?.ia_name || msg.from_ia}
              </div>
              <div className="text-blue-700 text-xs">
                {msg.detected_questions[0]}
              </div>
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={() => {
          navigator.clipboard.writeText(JSON.stringify(urls, null, 2));
          alert("📋 URLs copiées dans le presse-papiers !");
        }}
        className="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
      >
        📋 Copier toutes les URLs
      </button>
    </div>
  );
};