/**
 * Context global du Café Virtuel
 * Gère l'état de la session active, messages, orchestration
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cafeApi } from '../services/cafeApi';

const CafeContext = createContext();

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error('useCafe must be used within CafeProvider');
  }
  return context;
};

export const CafeProvider = ({ children }) => {
  // État global
  const [activeSession, setActiveSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [orchestrationMode, setOrchestrationMode] = useState('barman'); // barman, pilote, sommelier
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // États Mem4Ristor
  const STATE_COLORS = {
    certitude: '#10b981',
    probable: '#fbbf24',
    incertain: '#f97316',
    intuition: '#3b82f6',
    oracle: '#8b5cf6',
    recherche: '#6b7280'
  };

  const STATE_EMOJIS = {
    certitude: '🟢',
    probable: '🟡',
    incertain: '🟠',
    intuition: '🔵',
    oracle: '🔮',
    recherche: '🔍'
  };

  // Chargement initial
  useEffect(() => {
    loadActiveSession();
    loadSessions();
  }, []);

  const loadActiveSession = useCallback(async () => {
    try {
      const session = await cafeApi.getActiveSession();
      setActiveSession(session);
    } catch (err) {
      console.log('Pas de session active');
    }
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const sessionList = await cafeApi.listSessions(50);
      setSessions(sessionList);
    } catch (err) {
      console.error('Erreur chargement sessions:', err);
    }
  }, []);

  // Créer une nouvelle session
  const createSession = useCallback(async (config) => {
    setLoading(true);
    setError(null);
    try {
      const newSession = await cafeApi.createSession(config);
      setActiveSession(newSession);
      setOrchestrationMode(config.orchestration_mode);
      await loadSessions();
      return newSession;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadSessions]);

  // Ajouter un message
  const addMessage = useCallback(async (messageData) => {
    if (!activeSession) {
      throw new Error('Pas de session active');
    }

    setLoading(true);
    try {
      const updatedSession = await cafeApi.addMessage({
        ...messageData,
        session_id: activeSession.id
      });
      setActiveSession(updatedSession);

      // Si mode Sommelier ou Pilote, obtenir suggestion/prochaine IA
      if (orchestrationMode === 'sommelier' && updatedSession.messages.length > 0) {
        const lastMessage = updatedSession.messages[updatedSession.messages.length - 1];
        // Vérifier que le message a un formatted_message avant d'appeler getSuggestion
        if (lastMessage.formatted_message) {
          const sugg = await cafeApi.getSuggestion(activeSession.id, lastMessage.id);
          setSuggestion(sugg);
        }
      } else if (orchestrationMode === 'pilote' && updatedSession.messages.length > 0) {
        const nextIA = await cafeApi.getNextIA(activeSession.id);
        if (nextIA) {
          // TODO: Envoyer automatiquement au prochain IA via extension Chrome
          console.log('Mode Pilote: Prochain IA =', nextIA);
        }
      }

      return updatedSession;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activeSession, orchestrationMode]);

  // Accepter une suggestion (Mode Sommelier)
  const acceptSuggestion = useCallback(() => {
    if (suggestion && suggestion.suggested_target_ia) {
      // TODO: Router vers l'IA suggérée via extension Chrome
      console.log('Suggestion acceptée:', suggestion.suggested_target_ia);
    }
    setSuggestion(null);
  }, [suggestion]);

  // Refuser une suggestion
  const rejectSuggestion = useCallback(() => {
    setSuggestion(null);
  }, []);

  // Mettre en pause/reprendre
  const pauseSession = useCallback(async () => {
    if (!activeSession) return;
    try {
      await cafeApi.pauseSession(activeSession.id);
      setActiveSession({ ...activeSession, status: 'paused' });
    } catch (err) {
      setError(err.message);
    }
  }, [activeSession]);

  const resumeSession = useCallback(async () => {
    if (!activeSession) return;
    try {
      await cafeApi.resumeSession(activeSession.id);
      setActiveSession({ ...activeSession, status: 'active' });
    } catch (err) {
      setError(err.message);
    }
  }, [activeSession]);

  // Terminer la session
  const completeSession = useCallback(async () => {
    if (!activeSession) return;
    try {
      await cafeApi.completeSession(activeSession.id);
      setActiveSession({ ...activeSession, status: 'completed' });
      await loadSessions();
    } catch (err) {
      setError(err.message);
    }
  }, [activeSession, loadSessions]);

  // Exporter
  const exportSession = useCallback(async (format = 'local', formats = ['markdown', 'json']) => {
    if (!activeSession) return;
    try {
      if (format === 'local') {
        return await cafeApi.exportToLocal(activeSession.id, formats);
      } else if (format === 'github') {
        return await cafeApi.exportToGithub(activeSession.id);
      } else if (format === 'email') {
        return await cafeApi.exportToEmail(activeSession.id);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [activeSession]);

  // Rechercher dans l'historique
  const searchSessions = useCallback(async (query) => {
    try {
      const results = await cafeApi.searchSessions(query);
      return results;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  const value = {
    // État
    activeSession,
    sessions,
    orchestrationMode,
    suggestion,
    loading,
    error,
    
    // Constantes
    STATE_COLORS,
    STATE_EMOJIS,
    
    // Actions
    createSession,
    addMessage,
    setOrchestrationMode,
    acceptSuggestion,
    rejectSuggestion,
    pauseSession,
    resumeSession,
    completeSession,
    exportSession,
    searchSessions,
    loadActiveSession,
    loadSessions,
  };

  return <CafeContext.Provider value={value}>{children}</CafeContext.Provider>;
};
