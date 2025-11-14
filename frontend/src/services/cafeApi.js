/**
 * Service API pour le Café Virtuel
 * Communique avec le backend FastAPI
 */
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const CAFE_API = `${API_BASE_URL}/api/cafe`;

class CafeApiService {
  // ============================================
  // SESSIONS
  // ============================================

  async createSession(config) {
    const response = await axios.post(`${CAFE_API}/sessions`, { config });
    return response.data;
  }

  async getSession(sessionId) {
    const response = await axios.get(`${CAFE_API}/sessions/${sessionId}`);
    return response.data;
  }

  async listSessions(limit = 50, status = null) {
    const params = { limit };
    if (status) params.status = status;
    const response = await axios.get(`${CAFE_API}/sessions`, { params });
    return response.data;
  }

  async getActiveSession() {
    const response = await axios.get(`${CAFE_API}/sessions/active/current`);
    return response.data;
  }

  async pauseSession(sessionId) {
    const response = await axios.post(`${CAFE_API}/sessions/${sessionId}/pause`);
    return response.data;
  }

  async resumeSession(sessionId) {
    const response = await axios.post(`${CAFE_API}/sessions/${sessionId}/resume`);
    return response.data;
  }

  async completeSession(sessionId) {
    const response = await axios.post(`${CAFE_API}/sessions/${sessionId}/complete`);
    return response.data;
  }

  async searchSessions(query) {
    const response = await axios.get(`${CAFE_API}/sessions/search/${encodeURIComponent(query)}`);
    return response.data;
  }

  // ============================================
  // MESSAGES
  // ============================================

  async addMessage(messageData) {
    const response = await axios.post(`${CAFE_API}/messages`, messageData);
    return response.data;
  }

  // 🐛 CORRECTION : Fonction pour envoyer un message initial (Mode Barman/Pilote)
  async sendMessage(payload) {
    const formattedPayload = {
      session_id: payload.sessionId || payload.session_id,
      target_ais: payload.targetAIs || payload.target_ais,
      message: payload.message,
      cafe_type: payload.cafeType || payload.cafe_type,
      mode: payload.mode,
      is_human: payload.is_human || false
    };
    
    const response = await axios.post(`${CAFE_API}/send_message`, formattedPayload);
    return response.data;
  }  // ============================================
  // MESSAGES
  // ============================================

  async addMessage(messageData) {
    const response = await axios.post(`${CAFE_API}/messages`, messageData);
    return response.data;
  }

  // ============================================
  // ORCHESTRATION
  // ============================================

  async getSuggestion(sessionId, messageId) {
    const response = await axios.get(`${CAFE_API}/orchestration/suggest/${sessionId}/${messageId}`);
    return response.data;
  }

  async getNextIA(sessionId) {
    const response = await axios.get(`${CAFE_API}/orchestration/next-ia/${sessionId}`);
    return response.data;
  }

  // ============================================
  // STATISTIQUES
  // ============================================

  async getSessionStats(sessionId) {
    const response = await axios.get(`${CAFE_API}/stats/${sessionId}`);
    return response.data;
  }

  async getPitchFormat(sessionId) {
    const response = await axios.get(`${CAFE_API}/stats/${sessionId}/pitch`);
    return response.data;
  }

  // ============================================
  // EXPORTS
  // ============================================

  async exportToLocal(sessionId, formats = ['markdown', 'json']) {
    const response = await axios.post(`${CAFE_API}/export/${sessionId}/local`, { formats });
    return response.data;
  }

  async exportToGithub(sessionId) {
    const response = await axios.post(`${CAFE_API}/export/${sessionId}/github`);
    return response.data;
  }

  async exportToEmail(sessionId, recipient = 'cafevirtuel.coop@gmail.com') {
    const response = await axios.post(`${CAFE_API}/export/${sessionId}/email`, { recipient });
    return response.data;
  }

  // ============================================
  // PARTICIPANTS
  // ============================================

  async updateParticipantAvailability(sessionId, iaName, isAvailable, tokensRemaining = null) {
    const response = await axios.put(
      `${CAFE_API}/sessions/${sessionId}/participants/${iaName}/availability`,
      { is_available: isAvailable, tokens_remaining: tokensRemaining }
    );
    return response.data;
  }
  async updateParticipantUrls(sessionId, urls) {
  const response = await axios.post(
    `${CAFE_API}/sessions/${sessionId}/participants/urls`,
    { urls }
  );
  return response.data;
}

  // ============================================
  // CONFIGURATION
  // ============================================

  async getCafeRules() {
    const response = await axios.get(`${CAFE_API}/config/rules`);
    return response.data.rules;
  }

  async updateCafeRules(rules) {
    const response = await axios.put(`${CAFE_API}/config/rules`, { rules });
    return response.data;
  }
}

export const cafeApi = new CafeApiService();
