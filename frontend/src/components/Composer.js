/**
 * Composer - Zone de saisie avec boutons Cafés et sélection mode
 */
import React, { useState } from 'react';
import { useCafe } from '../context/CafeContext';

const Composer = () => {
  const { 
    activeSession, 
    addMessage, 
    orchestrationMode, 
    setOrchestrationMode,
    loading 
  } = useCafe();

  const [message, setMessage] = useState('');
  const [selectedCafe, setSelectedCafe] = useState('long');
  const [targetIA, setTargetIA] = useState('');
  const [sendingBriefing, setSendingBriefing] = useState(false);

  const availableIAs = activeSession?.config.participants.filter(p => p.is_available) || [];

  const handleSend = async () => {
    if (!message.trim() || !activeSession) return;

    try {
      // Construire le message au format prédéfini
      const now = new Date();
      const timestamp = now.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const rawContent = `[Début de réponse]
[Julien]-[${timestamp}] - [Le Barman] - [${selectedCafe}] - [certitude]

${message}

[@ ${targetIA || 'Tous'}] ""
[Julien] - Le Barman
[Fin de réponse]`;

      await addMessage({
        from_ia: 'Julien',
        to_ia: targetIA || null,
        raw_content: rawContent,
        is_human: true
      });

      // Réinitialiser
      setMessage('');
      setTargetIA('');
    } catch (err) {
      console.error('Erreur envoi message:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSendBriefing = async () => {
    if (!activeSession) return;
    
    setSendingBriefing(true);
    try {
      // Récupérer les règles du backend
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cafe/config/rules`);
      const data = await response.json();
      const rules = data.rules;
      
      // Envoyer aux IAs via extension Chrome
      if (window.chrome && window.chrome.runtime) {
        // Envoyer à tous les onglets IA disponibles
        availableIAs.forEach((ia) => {
          window.chrome.runtime.sendMessage({
            type: "MANUAL_BRIEFING",
            rules: rules,
            target: ia.name
          });
        });
        
        alert('✅ Briefing envoyé à toutes les IAs disponibles !');
      } else {
        alert('⚠️ Extension Chrome non détectée. Assurez-vous qu\'elle est chargée.');
      }
    } catch (err) {
      console.error('Erreur envoi briefing:', err);
      alert('❌ Erreur lors de l\'envoi du briefing');
    } finally {
      setSendingBriefing(false);
    }
  };

  if (!activeSession) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
      {/* Mode d'orchestration */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setOrchestrationMode('barman')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            orchestrationMode === 'barman'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          disabled={loading}
        >
          🧑 Barman
        </button>
        <button
          onClick={() => setOrchestrationMode('pilote')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            orchestrationMode === 'pilote'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          disabled={loading}
        >
          🤖 Pilote
        </button>
        <button
          onClick={() => setOrchestrationMode('sommelier')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            orchestrationMode === 'sommelier'
              ? 'bg-amber-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          disabled={loading}
        >
          🍷 Sommelier
        </button>
      </div>

      {/* Destinataire */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destinataire
        </label>
        <select
          value={targetIA}
          onChange={(e) => setTargetIA(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={loading}
        >
          <option value="">@ Tous</option>
          {availableIAs.map((ia) => (
            <option key={ia.name} value={ia.name}>
              @ {ia.name}
              {ia.tokens_remaining !== null && ` (${ia.tokens_remaining} tokens restants)`}
            </option>
          ))}
        </select>
      </div>

      {/* Zone de texte */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Votre message ici... (Shift+Enter pour nouvelle ligne, Enter pour envoyer)"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        rows="4"
        disabled={loading}
      />

      {/* Boutons Cafés */}
      <div className="flex gap-2 mt-3 mb-3">
        <button
          onClick={() => setSelectedCafe('expresso')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            selectedCafe === 'expresso'
              ? 'bg-amber-900 text-white shadow-md'
              : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
          }`}
          disabled={loading}
        >
          ☕ Expresso
        </button>
        <button
          onClick={() => setSelectedCafe('long')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            selectedCafe === 'long'
              ? 'bg-amber-700 text-white shadow-md'
              : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
          }`}
          disabled={loading}
        >
          ☕ Café Long
        </button>
        <button
          onClick={() => setSelectedCafe('cosmique')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            selectedCafe === 'cosmique'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-purple-50 text-purple-900 hover:bg-purple-100'
          }`}
          disabled={loading}
        >
          ☕ Cosmique
        </button>
        <button
          onClick={() => setSelectedCafe('gourmand')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            selectedCafe === 'gourmand'
              ? 'bg-pink-600 text-white shadow-md'
              : 'bg-pink-50 text-pink-900 hover:bg-pink-100'
          }`}
          disabled={loading}
        >
          🍰 Gourmand
        </button>
      </div>

      {/* Bouton Briefing Manuel */}
      <button
        onClick={handleSendBriefing}
        disabled={sendingBriefing || !activeSession}
        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg mb-2"
      >
        {sendingBriefing ? '⏳ Envoi du briefing...' : '📣 Briefer les IAs (Manuel)'}
      </button>

      {/* Bouton Envoyer */}
      <button
        onClick={handleSend}
        disabled={!message.trim() || loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
      >
        {loading ? '⏳ Envoi...' : '📤 Envoyer'}
      </button>

      {/* Info mode */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        {orchestrationMode === 'barman' && '🧑 Mode Barman : Contrôle manuel total'}
        {orchestrationMode === 'pilote' && '🤖 Mode Pilote : Orchestration automatique'}
        {orchestrationMode === 'sommelier' && '🍷 Mode Sommelier : Suggestions validables'}
      </div>
    </div>
  );
};

export default Composer;
