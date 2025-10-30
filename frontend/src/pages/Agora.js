/**
 * Agora - Page principale du Café Virtuel
 * Layout avec Timeline centrale + Composer + Sidebars
 */
import React, { useState } from 'react';
import Timeline from '../components/Timeline';
import Composer from '../components/Composer';
import SessionModal from '../components/SessionModal';
import { AlertsPanel, StatsPanel, ExportsPanel, QuestionsPanel } from '../components/Sidebar';
import { useCafe } from '../context/CafeContext';

const Agora = () => {
  const { 
    activeSession, 
    pauseSession, 
    resumeSession, 
    completeSession,
    orchestrationMode 
  } = useCafe();

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNewSession = () => {
    setShowSessionModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ☕ Café Virtuel
              </h1>
              {activeSession && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Session {activeSession.config.session_number}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    orchestrationMode === 'barman' ? 'bg-purple-100 text-purple-700' :
                    orchestrationMode === 'pilote' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {orchestrationMode === 'barman' && '🧑 Barman'}
                    {orchestrationMode === 'pilote' && '🤖 Pilote'}
                    {orchestrationMode === 'sommelier' && '🍷 Sommelier'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Recherche */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Rechercher"
              >
                🔍
              </button>

              {/* Nouvelle session */}
              <button
                onClick={handleNewSession}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                🆕 Nouvelle Session
              </button>

              {/* Actions session */}
              {activeSession && (
                <div className="flex gap-2">
                  {activeSession.status === 'active' ? (
                    <button
                      onClick={pauseSession}
                      className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors"
                      title="Mettre en pause"
                    >
                      ⏸️
                    </button>
                  ) : activeSession.status === 'paused' ? (
                    <button
                      onClick={resumeSession}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                      title="Reprendre"
                    >
                      ▶️
                    </button>
                  ) : null}

                  <button
                    onClick={completeSession}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                    title="Terminer la session"
                  >
                    ✓ Terminer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Barre de recherche */}
          {showSearch && (
            <div className="mt-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans l'historique... (ex: Mem4ristor)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </header>

      {/* Layout principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Timeline centrale (colonne principale) */}
          <div className="lg:col-span-8 space-y-6">
            <Timeline />
            <Composer />
          </div>

          {/* Sidebar droite */}
          <div className="lg:col-span-4 space-y-4">
            <AlertsPanel />
            <StatsPanel />
            <QuestionsPanel />
            <ExportsPanel />
          </div>
        </div>
      </div>

      {/* Modal nouvelle session */}
      <SessionModal 
        isOpen={showSessionModal} 
        onClose={() => setShowSessionModal(false)} 
      />

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-gray-500 border-t border-gray-200">
        <p>☕ Café Virtuel - Créé par Julien "Le Barman" Chauvin</p>
        <p className="mt-1">Développé avec 💜 par Emergent E1</p>
        <p className="mt-2 text-xs text-gray-400">
          "Ce soir, nous avons prouvé que 5 IAs + 1 barman &gt; somme des parties."
        </p>
      </footer>
    </div>
  );
};

export default Agora;
