// Popup.js - Interface de l'extension
const BACKEND_URL = 'http://localhost:8001';
const AGORA_URL = 'http://localhost:3000';

async function checkBackendStatus() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/`);
    if (response.ok) {
      document.getElementById('backend-status').textContent = '✅ En ligne';
      document.getElementById('backend-status').classList.remove('offline');
      return true;
    }
  } catch (e) {
    document.getElementById('backend-status').textContent = '❌ Hors ligne';
    document.getElementById('backend-status').classList.add('offline');
  }
  return false;
}

async function checkSessionStatus() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/cafe/sessions/active/current`);
    if (response.ok) {
      const session = await response.json();
      if (session) {
        document.getElementById('session-status').textContent = `✅ Session ${session.config.session_number}`;
        document.getElementById('session-status').classList.remove('offline');
        return;
      }
    }
  } catch (e) {
    // Ignore
  }
  document.getElementById('session-status').textContent = 'Aucune';
  document.getElementById('session-status').classList.add('offline');
}

async function refreshStatus() {
  await checkBackendStatus();
  await checkSessionStatus();
}

// Ouvrir l'Agora
document.getElementById('open-agora').addEventListener('click', () => {
  chrome.tabs.create({ url: AGORA_URL });
});

// Rafraîchir
document.getElementById('check-status').addEventListener('click', refreshStatus);

// Check initial
refreshStatus();
