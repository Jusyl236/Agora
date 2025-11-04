// Café Virtuel – Content Script Claude V2.1 (Conversation Sticky + Briefing Manuel)
(function () {
  const AGENT = "Claude";
  const log = (...a) => { try { console.log("[Claude CS]", ...a); } catch {} };

  let conversationUrl = null;

  // Capturer l'URL de conversation
  function captureConversationUrl() {
    const url = window.location.href;
    // Claude URLs: https://claude.ai/chat/abc-123-def
    if (url.includes('/chat/')) {
      conversationUrl = url;
      log("📌 Conversation URL capturée:", conversationUrl);
      return conversationUrl;
    }
    return null;
  }

  // Détecter changement d'URL
  let lastUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      captureConversationUrl();
    }
  }, 500);

  // HELLO au Service Worker
  chrome.runtime.sendMessage({ 
    type: "HELLO_IA", 
    agent: AGENT,
    conversationUrl: captureConversationUrl()
  }, (res) => {
    log("HELLO_IA ack:", res);
  });

  // Listener pour messages entrants
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    
    // === Briefing automatique ===
    if (msg?.type === "BRIEFING" && msg.rules && !briefingReceived) {
      log("📣 Briefing reçu, injection dans Claude...");
      briefingReceived = true;
      
      const ta = document.querySelector('div[contenteditable="true"], textarea');
      if (ta) {
        ta.focus();
        
        if (ta.tagName === 'TEXTAREA') {
          ta.value = `Bonjour Claude ! Bienvenue au Café Virtuel 🌌☕\n\n${msg.rules}\n\nMerci de confirmer : "✅ Règles comprises !"`;
          ta.dispatchEvent(new InputEvent('input', { bubbles: true }));
        } else {
          ta.textContent = `Bonjour Claude ! Bienvenue au Café Virtuel 🌌☕\n\n${msg.rules}\n\nMerci de confirmer : "✅ Règles comprises !"`;
          ta.dispatchEvent(new InputEvent('input', { bubbles: true }));
        }
        
        setTimeout(() => {
          const sendBtn = document.querySelector('button[aria-label*="Send"], button:has(svg)');
          if (sendBtn) sendBtn.click();
        }, 500);
      }
      
      sendResponse?.({ ok: true });
      return true;
    }

    // === Message Agora → Claude ===
    if (msg?.type === "AGORA_TO_IA" && msg.to === AGENT) {
      log("AGORA_TO_IA reçu:", msg);

      const ta = document.querySelector('div[contenteditable="true"], textarea');
      if (!ta) {
        sendResponse?.({ ok: false, error: "input introuvable" });
        return true;
      }
      
      ta.focus();
      
      if (ta.tagName === 'TEXTAREA') {
        ta.value = msg.text ?? "";
        ta.dispatchEvent(new InputEvent('input', { bubbles: true }));
      } else {
        ta.textContent = msg.text ?? "";
        ta.dispatchEvent(new InputEvent('input', { bubbles: true }));
      }

      setTimeout(() => {
        const sendBtn = document.querySelector('button[aria-label*="Send"], button:has(svg)');
        if (sendBtn) {
          sendBtn.click();
        } else {
          const pressEnter = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
          ta.dispatchEvent(pressEnter);
        }
      }, 300);

      // Capture de la réponse
      const t0 = Date.now();
      let lastText = "";
      let stableCount = 0;
      
      const getAssistantText = () => {
        // Claude utilise différents sélecteurs selon la version
        const messages = Array.from(document.querySelectorAll('[data-test-render-count], .font-claude-message, div[class*="message"]'));
        const assistantMessages = messages.filter(m => {
          const text = m.textContent || m.innerText;
          return text && text.length > 20 && !text.includes('You:') && !text.includes('Vous:');
        });
        
        const lastMsg = assistantMessages[assistantMessages.length - 1];
        return lastMsg ? (lastMsg.innerText || lastMsg.textContent).trim() : null;
      };

      const poll = () => {
        const txt = getAssistantText();
        
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
[${AGENT}] - Toujours à votre disposition
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
    const messages = Array.from(document.querySelectorAll('[data-test-render-count], .font-claude-message, div[class*="message"]'));
    const assistantMessages = messages.filter(m => {
      const text = m.textContent || m.innerText;
      return text && text.length > 20 && !text.includes('You:') && !text.includes('Vous:');
    });
    
    if (assistantMessages.length === 0) return;
    
    const lastMsg = assistantMessages[assistantMessages.length - 1];
    const txt = (lastMsg.innerText || lastMsg.textContent).trim();
    
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
[${AGENT}] - Toujours à votre disposition
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

  log("✅ Content Script Claude V2.0 injecté (Backend + Briefing + Auto-capture)");
})();
