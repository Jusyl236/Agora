// Café Virtuel – Content Script ChatGPT V2.0 (Backend intégré)
(function () {
  const AGENT = "ChatGPT";
  const log = (...a) => { try { console.log("[ChatGPT CS]", ...a); } catch {} };

  let briefingReceived = false;

  // ============================================
  // HELLO au Service Worker
  // ============================================
  chrome.runtime.sendMessage({ type: "HELLO_IA", agent: AGENT }, (res) => {
    log("HELLO_IA ack:", res);
  });

  // ============================================
  // Listener pour messages entrants
  // ============================================
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    
    // === Briefing automatique ===
    if (msg?.type === "BRIEFING" && msg.rules && !briefingReceived) {
      log("📣 Briefing reçu, injection dans ChatGPT...");
      briefingReceived = true;
      
      // Injecter le briefing dans ChatGPT
      const ta = document.querySelector('textarea[data-id="root"], textarea');
      if (ta) {
        ta.focus();
        ta.value = `Bonjour ! Bienvenue au Café Virtuel 🌌☕

Voici les règles de notre session :

${msg.rules}

Merci de confirmer que vous avez bien compris les règles en répondant :
"✅ Règles du Café Virtuel comprises. Je suis prêt(e) à participer !"`;
        
        ta.dispatchEvent(new InputEvent('input', { bubbles: true }));
        
        // Auto-send si possible
        setTimeout(() => {
          const sendBtn = document.querySelector('button[data-testid="send-button"], button[aria-label*="Send"]');
          if (sendBtn) sendBtn.click();
        }, 500);
      }
      
      sendResponse?.({ ok: true });
      return true;
    }

    // === Message Agora → ChatGPT ===
    if (msg?.type === "AGORA_TO_IA" && msg.to === AGENT) {
      log("AGORA_TO_IA reçu:", msg);

      // 1) Remplir textarea
      const ta = document.querySelector('textarea[data-id="root"], textarea');
      if (!ta) {
        sendResponse?.({ ok: false, error: "textarea introuvable" });
        return true;
      }
      
      ta.focus();
      ta.value = msg.text ?? "";
      ta.dispatchEvent(new InputEvent('input', { bubbles: true }));

      // 2) Envoi
      setTimeout(() => {
        const sendBtn = document.querySelector('button[data-testid="send-button"], button[aria-label*="Send"]');
        if (sendBtn) {
          sendBtn.click();
        } else {
          const pressEnter = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
          ta.dispatchEvent(pressEnter);
        }
      }, 300);

      // 3) Capture de la réponse (avec streaming)
      const t0 = Date.now();
      let lastText = "";
      let stableCount = 0;
      
      const getAssistantText = () => {
        const messages = Array.from(document.querySelectorAll('div[data-message-author-role="assistant"]'));
        const lastMsg = messages[messages.length - 1];
        return lastMsg ? (lastMsg.innerText || lastMsg.textContent).trim() : null;
      };

      const poll = () => {
        const txt = getAssistantText();
        
        // Vérifie si le texte a arrêté de changer (streaming terminé)
        if (txt && txt.length > 10) {
          if (txt === lastText) {
            stableCount++;
            if (stableCount >= 3) { // 3 secondes stable = réponse complète
              log("✅ Réponse complète capturée");
              
              // Formater au format prédéfini
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
[${AGENT}]-[${timestamp}] - [Assistant IA] - [long] - [probable]

${txt}

[@ ${msg.from || 'Julien'}] ""
[${AGENT}] - Toujours à votre service
[Fin de réponse]`;

              const payload = {
                type: "IA_TO_BACKEND",
                from: AGENT,
                to: msg.from || null,
                raw_content: rawContent,
                hash: `${Date.now()}-${Math.random().toString(36).slice(2)}`
              };
              
              chrome.runtime.sendMessage(payload, (ack) => log("IA_TO_BACKEND ack:", ack));
              sendResponse?.({ ok: true, agent: AGENT });
              return;
            }
          } else {
            lastText = txt;
            stableCount = 0;
          }
        }
        
        if (Date.now() - t0 > 60000) { // Timeout 60s
          sendResponse?.({ ok: false, error: "timeout réponse" });
          return;
        }
        
        setTimeout(poll, 1000);
      };
      
      setTimeout(poll, 2000); // Délai initial
      return true; // Async response
    }
    
    return false;
  });

  // ============================================
  // Auto-capture des nouvelles réponses (mode veille)
  // ============================================
  let lastCapturedText = "";
  
  setInterval(() => {
    const messages = Array.from(document.querySelectorAll('div[data-message-author-role="assistant"]'));
    if (messages.length === 0) return;
    
    const lastMsg = messages[messages.length - 1];
    const txt = (lastMsg.innerText || lastMsg.textContent).trim();
    
    if (txt && txt !== lastCapturedText && txt.length > 20) {
      lastCapturedText = txt;
      log("🔔 Nouvelle réponse auto-détectée");
      
      // Envoyer au backend si session active
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
[${AGENT}]-[${timestamp}] - [Assistant IA] - [long] - [probable]

${txt}

[@ Julien] ""
[${AGENT}] - Toujours à votre service
[Fin de réponse]`;

      const payload = {
        type: "IA_TO_BACKEND",
        from: AGENT,
        to: null,
        raw_content: rawContent,
        hash: `${Date.now()}-${Math.random().toString(36).slice(2)}`
      };
      
      chrome.runtime.sendMessage(payload);
    }
  }, 3000); // Check toutes les 3 secondes

  log("✅ Content Script ChatGPT V2.0 injecté (Backend + Briefing + Auto-capture)");
})();
