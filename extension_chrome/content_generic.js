// Café Virtuel – Content Script Générique V2.0
// Utilisé pour : Mistral, Grok, DeepSeek, Gemini, Perplexity, QWEN, Manus AI
(function () {
  // Déterminer l'agent selon l'URL
  const url = window.location.hostname;
  let AGENT = "Unknown";
  
  if (url.includes("mistral.ai")) AGENT = "Mistral";
  else if (url.includes("x.ai")) AGENT = "Grok";
  else if (url.includes("deepseek.com")) AGENT = "DeepSeek";
  else if (url.includes("gemini.google.com")) AGENT = "Gemini";
  else if (url.includes("perplexity.ai")) AGENT = "Perplexity";
  else if (url.includes("qwen.ai")) AGENT = "QWEN";
  else if (url.includes("manus.ai")) AGENT = "Manus AI";
  
  const log = (...a) => { try { console.log(`[${AGENT} CS]`, ...a); } catch {} };

  let briefingReceived = false;

  // HELLO au Service Worker
  chrome.runtime.sendMessage({ type: "HELLO_IA", agent: AGENT }, (res) => {
    log("HELLO_IA ack:", res);
  });

  // ============================================
  // Fonctions utilitaires
  // ============================================
  
  const findTextarea = () => {
    // Cherche différents types d'inputs
    const selectors = [
      'textarea',
      'div[contenteditable="true"]',
      'input[type="text"]',
      '[role="textbox"]'
    ];
    
    for (const sel of selectors) {
      const elem = document.querySelector(sel);
      if (elem) return elem;
    }
    return null;
  };

  const setText = (elem, text) => {
    if (!elem) return;
    
    elem.focus();
    
    if (elem.tagName === 'TEXTAREA' || elem.tagName === 'INPUT') {
      elem.value = text;
      elem.dispatchEvent(new InputEvent('input', { bubbles: true }));
    } else {
      elem.textContent = text;
      elem.dispatchEvent(new InputEvent('input', { bubbles: true }));
    }
  };

  const clickSendButton = () => {
    // Cherche le bouton d'envoi
    const selectors = [
      'button[type="submit"]',
      'button[aria-label*="Send"]',
      'button[aria-label*="Envoyer"]',
      'button:has(svg)',
      'button[class*="send"]'
    ];
    
    for (const sel of selectors) {
      const btn = document.querySelector(sel);
      if (btn && !btn.disabled) {
        btn.click();
        return true;
      }
    }
    
    // Fallback: Entrée
    const ta = findTextarea();
    if (ta) {
      const pressEnter = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
      ta.dispatchEvent(pressEnter);
      return true;
    }
    
    return false;
  };

  const getLastAssistantMessage = () => {
    // Cherche le dernier message de l'assistant
    const messageSelectors = [
      '[data-role="assistant"]',
      '[data-message-author-role="assistant"]',
      '.assistant-message',
      '[class*="assistant"]',
      '[class*="response"]',
      '[class*="message"]'
    ];
    
    for (const sel of messageSelectors) {
      const messages = Array.from(document.querySelectorAll(sel));
      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        const txt = (lastMsg.innerText || lastMsg.textContent).trim();
        if (txt.length > 20) return txt;
      }
    }
    
    return null;
  };

  // ============================================
  // Listener pour messages entrants
  // ============================================
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    
    // === Briefing automatique ===
    if (msg?.type === "BRIEFING" && msg.rules && !briefingReceived) {
      log("📣 Briefing reçu, injection...");
      briefingReceived = true;
      
      const ta = findTextarea();
      if (ta) {
        setText(ta, `Bonjour ! Bienvenue au Café Virtuel 🌌☕\n\n${msg.rules}\n\nMerci de confirmer : "✅ Règles comprises !"`);
        
        setTimeout(() => {
          clickSendButton();
        }, 500);
      }
      
      sendResponse?.({ ok: true });
      return true;
    }

    // === Message Agora → IA ===
    if (msg?.type === "AGORA_TO_IA" && msg.to === AGENT) {
      log("AGORA_TO_IA reçu:", msg);

      const ta = findTextarea();
      if (!ta) {
        sendResponse?.({ ok: false, error: "input introuvable" });
        return true;
      }
      
      setText(ta, msg.text ?? "");

      setTimeout(() => {
        clickSendButton();
      }, 300);

      // Capture de la réponse
      const t0 = Date.now();
      let lastText = "";
      let stableCount = 0;

      const poll = () => {
        const txt = getLastAssistantMessage();
        
        if (txt && txt.length > 10) {
          if (txt === lastText) {
            stableCount++;
            if (stableCount >= 3) {
              log("✅ Réponse complète capturée");
              
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
[${AGENT}] - À votre service
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
        
        if (Date.now() - t0 > 60000) {
          sendResponse?.({ ok: false, error: "timeout réponse" });
          return;
        }
        
        setTimeout(poll, 1000);
      };
      
      setTimeout(poll, 2000);
      return true;
    }
    
    return false;
  });

  // Auto-capture
  let lastCapturedText = "";
  
  setInterval(() => {
    const txt = getLastAssistantMessage();
    
    if (txt && txt !== lastCapturedText && txt.length > 20) {
      lastCapturedText = txt;
      log("🔔 Nouvelle réponse auto-détectée");
      
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
[${AGENT}] - À votre service
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
  }, 3000);

  log(`✅ Content Script ${AGENT} V2.0 injecté (Backend + Briefing + Auto-capture)`);
})();
