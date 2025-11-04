// Café Virtuel – Service Worker V2.0 (Intégration Backend)
const REG = { 
  agora: null, 
  iaTabs: {},
  conversationUrls: {} // Stocker les URLs de conversation par IA
};
const SEEN = new Set();

// Backend API
const BACKEND_URL = 'http://localhost:8001';
const API_BASE = `${BACKEND_URL}/api/cafe`;

const AGENT_URLS = {
  ChatGPT: ["chatgpt.com", "chat.openai.com"],
  Claude: ["claude.ai"],
  Mistral: ["chat.mistral.ai"],
  Grok: ["x.ai"],
  DeepSeek: ["chat.deepseek.com"],
  Gemini: ["gemini.google.com"],
  Perplexity: ["perplexity.ai"],
  QWEN: ["qwen.ai"],
  "Manus AI": ["manus.ai"]
};

// ============================================
// Fonctions Backend
// ============================================

async function getActiveSession() {
  try {
    const response = await fetch(`${API_BASE}/sessions/active/current`);
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    console.warn('[SW] Erreur getActiveSession:', e);
    return null;
  }
}

async function addMessageToBackend(sessionId, messageData) {
  try {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        ...messageData
      })
    });
    if (!response.ok) throw new Error('Erreur ajout message');
    return await response.json();
  } catch (e) {
    console.error('[SW] Erreur addMessageToBackend:', e);
    return null;
  }
}

async function getNextIA(sessionId) {
  try {
    const response = await fetch(`${API_BASE}/orchestration/next-ia/${sessionId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    console.warn('[SW] Erreur getNextIA:', e);
    return null;
  }
}

async function getCafeRules() {
  try {
    const response = await fetch(`${API_BASE}/config/rules`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.rules;
  } catch (e) {
    console.warn('[SW] Erreur getCafeRules:', e);
    return null;
  }
}

// ============================================
// Gestion des onglets
// ============================================

async function ensureAgentTab(agent) {
  if (REG.iaTabs[agent]) return REG.iaTabs[agent];
  
  try {
    const hosts = AGENT_URLS[agent] || [];
    const tabs = await chrome.tabs.query({});
    const hit = tabs.find(t => {
      try {
        const u = new URL(t.url || "");
        return hosts.some(h => u.host && u.host.includes(h));
      } catch { return false; }
    });
    
    if (hit) {
      REG.iaTabs[agent] = hit.id;
      console.log("[SW] Rebound:", agent, "→ tab", hit.id);
      return hit.id;
    }
  } catch (e) {
    console.warn("[SW] ensureAgentTab error:", e);
  }
  return null;
}

// ============================================
// Message Handler Principal
// ============================================

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      // === Agora fait signe ===
      if (msg?.type === "HELLO_AGORA") {
        REG.agora = sender.tab?.id || null;
        console.log("[SW] Agora ready from tab", REG.agora);
        sendResponse?.({ ok: true, role: "agora", tabId: REG.agora });
        return;
      }

      // === Un onglet IA se présente ===
      if (msg?.type === "HELLO_IA" && msg.agent) {
        REG.iaTabs[msg.agent] = sender.tab?.id || null;
        
        // Stocker l'URL de conversation si fournie
        if (msg.conversationUrl) {
          REG.conversationUrls[msg.agent] = msg.conversationUrl;
          console.log("[SW] Conversation URL enregistrée:", msg.agent, "→", msg.conversationUrl);
        }
        
        console.log("[SW] IA ready:", msg.agent, "tab", REG.iaTabs[msg.agent]);
        
        sendResponse?.({ ok: true, role: "ia", agent: msg.agent, tabId: REG.iaTabs[msg.agent] });
        return;
      }

      // === Message IA → Backend + Agora ===
      if (msg?.type === "IA_TO_BACKEND") {
        // Dédoublonnage
        if (msg.hash && SEEN.has(msg.hash)) {
          sendResponse?.({ ok: true, dedup: true });
          return;
        }
        if (msg.hash) SEEN.add(msg.hash);

        console.log("[SW] IA_TO_BACKEND from", msg.from);

        // 1. Sauvegarder dans le backend
        const session = await getActiveSession();
        if (session) {
          const updatedSession = await addMessageToBackend(session.id, {
            from_ia: msg.from,
            to_ia: msg.to,
            raw_content: msg.raw_content,
            is_human: false
          });

          // 2. Notifier l'Agora (frontend)
          if (REG.agora && updatedSession) {
            chrome.tabs.sendMessage(REG.agora, {
              type: "SESSION_UPDATED",
              session: updatedSession
            });
          }

          // 3. Mode Pilote : Router automatiquement vers la prochaine IA
          if (session.config.orchestration_mode === 'pilote') {
            const nextIA = await getNextIA(session.id);
            if (nextIA && REG.iaTabs[nextIA]) {
              console.log("[SW] Mode Pilote: Routing vers", nextIA);
              chrome.tabs.sendMessage(REG.iaTabs[nextIA], {
                type: "AGORA_TO_IA",
                text: msg.raw_content, // Contexte du message précédent
                from: msg.from
              });
            }
          }
        }

        sendResponse?.({ ok: true });
        return;
      }

      // === Message Agora/Backend → IA ===
      if (msg?.type === "AGORA_TO_IA") {
        let tabId = REG.iaTabs[msg.to];
        if (!tabId) tabId = await ensureAgentTab(msg.to);
        
        console.log("[SW] Relay AGORA_TO_IA to", msg.to, "→ tab", tabId);
        
        if (tabId) {
          chrome.tabs.sendMessage(tabId, msg, () =>
            sendResponse?.({ ok: true, rebound: !REG.iaTabs[msg.to] })
          );
        } else {
          sendResponse?.({ ok: false, error: "No tab for agent" });
        }
        return;
      }

      // Type inconnu
      sendResponse?.({ ok: false, error: "Unknown message type" });
    } catch (e) {
      console.warn("[SW] onMessage error:", e);
      try { sendResponse?.({ ok: false, error: String(e) }); } catch {}
    }
  })();

  return true; // Async response
});

console.log("[SW] Café Virtuel Service Worker V2.0 - Backend intégré ✅");
