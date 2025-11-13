import React, { useState, useEffect, useRef, useContext } from 'react';
import { CafeContext } from '../context/CafeContext';
import { cafeApi } from '../services/cafeApi';

const Composer = () => {
  const [message, setMessage] = useState('');
  const [selectedAIs, setSelectedAIs] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState('expresso');
  const [mode, setMode] = useState('barman');
  const { currentSession, addMessage } = useContext(CafeContext);
  const composerRef = useRef(null);

  // 🐛 CORRECTION : Ajout du cleanup pour éviter l'erreur React
  useEffect(() => {
    const handleModeChange = (e) => {
      if (e.detail && e.detail.mode) {
        setMode(e.detail.mode);
      }
    };
    
    window.addEventListener('modeChanged', handleModeChange);
    
    // ✅ CLEANUP : On enlève l'event listener quand le composant se démonte
    return () => {
      window.removeEventListener('modeChanged', handleModeChange);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || selectedAIs.length === 0) return;

    try {
      const payload = {
        sessionId: currentSession?.id,
        message: message,
        targetAIs: selectedAIs,
        cafeType: selectedCafe,
        mode: mode
      };

      const response = await cafeApi.sendMessage(payload);
      
      if (response.data) {
        addMessage(response.data);
        setMessage('');
        
        // Si Mode Pilote, on notifie l'extension
        if (mode === 'pilote') {
          window.dispatchEvent(new CustomEvent('piloteModeActivated', { 
            detail: { sessionId: currentSession?.id } 
          }));
        }
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      // 🐛 CORRECTION : On n'affiche pas d'alerte qui peut causer des problèmes DOM
      addMessage({
        id: Date.now(),
        sender: 'System',
        content: `❌ Erreur: ${error.message}`,
        timestamp: new Date().toISOString(),
        state: 'incertain'
      });
    }
  };

  const handleAIChange = (e) => {
    const options = Array.from(e.target.selectedOptions).map(o => o.value);
    setSelectedAIs(options);
  };

  const handleBriefing = async () => {
    try {
      await cafeApi.briefAIs({
        sessionId: currentSession?.id,
        ais: selectedAIs
      });
      
      addMessage({
        id: Date.now(),
        sender: 'System',
        content: '📣 Briefing envoyé aux IAs sélectionnées',
        timestamp: new Date().toISOString(),
        state: 'certitude'
      });
    } catch (error) {
      console.error('Erreur briefing:', error);
    }
  };

  // Gestion du clic sur un @mention dans la timeline
  useEffect(() => {
    const handleMentionClick = (e) => {
      if (e.target.classList.contains('mention')) {
        const aiName = e.target.dataset.ai;
        if (aiName && !selectedAIs.includes(aiName)) {
          setSelectedAIs(prev => [...prev, aiName]);
        }
      }
    };

    document.addEventListener('click', handleMentionClick);
    
    // ✅ CLEANUP : On enlève l'event listener
    return () => {
      document.removeEventListener('click', handleMentionClick);
    };
  }, [selectedAIs]);

  return (
    <div ref={composerRef} className="composer bg-slate-800 p-4 rounded-lg border border-amber-400/20">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <select 
            multiple 
            value={selectedAIs} 
            onChange={handleAIChange}
            className="flex-1 bg-slate-700 text-white p-2 rounded border border-slate-600"
            size="3"
          >
            <option value="ChatGPT">ChatGPT</option>
            <option value="Claude">Claude</option>
            <option value="Mistral">Mistral</option>
            <option value="Grok">Grok</option>
            <option value="DeepSeek">DeepSeek</option>
            <option value="Gemini">Gemini</option>
            <option value="Perplexity">Perplexity</option>
            <option value="QWEN">QWEN</option>
            <option value="Manus AI">Manus AI</option>
            <option value="Kimi">Kimi</option>
          </select>
        </div>

        <div className="flex gap-2">
          <select 
            value={selectedCafe} 
            onChange={(e) => setSelectedCafe(e.target.value)}
            className="bg-slate-700 text-white p-2 rounded border border-slate-600"
          >
            <option value="expresso">☕ Expresso</option>
            <option value="long">☕ Café Long</option>
            <option value="cosmique">☕ Café Cosmique</option>
            <option value="gourmand">🍰 Café Gourmand</option>
          </select>

          <select 
            value={mode} 
            onChange={(e) => {
              const newMode = e.target.value;
              setMode(newMode);
              // 🐛 CORRECTION : On dispatch l'événement proprement
              window.dispatchEvent(new CustomEvent('modeChanged', { detail: { mode: newMode } }));
            }}
            className="bg-slate-700 text-white p-2 rounded border border-slate-600"
          >
            <option value="barman">🧑 Mode Barman</option>
            <option value="pilote">🤖 Mode Pilote</option>
            <option value="sommelier">🍷 Mode Sommelier</option>
          </select>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Que souhaitez-vous discuter aujourd'hui ?..."
          className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 resize-none"
          rows="3"
        />

        <div className="flex gap-2 justify-between">
          <button 
            type="button" 
            onClick={handleBriefing}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
          >
            📣 Briefer les IAs
          </button>
          
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => setMessage('')}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors"
            >
              Effacer
            </button>
            <button 
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-6 py-2 rounded transition-colors"
            >
              Envoyer
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Composer;
