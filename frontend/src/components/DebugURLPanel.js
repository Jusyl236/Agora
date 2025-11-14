import React, { useState, useContext } from 'react';
import { useCafe } from '../context/CafeContext';

const DebugURLPanel = () => {
  const { currentSession } = useCafe();
  const [urls, setUrls] = useState({
    "ChatGPT": "",
    "Claude": "",
    "Mistral": "",
    "Grok": "",
    "DeepSeek": "",
    "Gemini": "",
    "Perplexity": "",
    "QWEN": "",
    "Manus AI": "",
    "Kimi": ""
  });

  const handleUrlChange = (iaName, url) => {
    setUrls(prev => ({ ...prev, [iaName]: url }));
    // On enverra ces URLs à l'extension plus tard
    console.log(`📍 URL mise à jour pour ${iaName} : ${url}`);
  };

  return (
    <div className="debug-panel bg-slate-800 p-4 rounded-lg border border-red-400/30 mt-4">
      <h3 className="text-amber-400 font-bold mb-4">🐛 DEBUG - URLs des Conversations</h3>
      
      {Object.entries(urls).map(([iaName, url]) => (
        <div key={iaName} className="mb-3 p-2 bg-slate-700 rounded">
          <label className="block text-sm font-bold text-amber-400 mb-1">{iaName}</label>
          <input
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(iaName, e.target.value)}
            placeholder={`Coller l'URL de ${iaName} ici...`}
            className="w-full bg-slate-900 text-white p-2 rounded border border-slate-600 text-xs"
          />
        </div>
      ))}
      
      <button
        onClick={() => {
          navigator.clipboard.writeText(JSON.stringify(urls, null, 2));
          alert("📋 URLs copiées dans le presse-papiers !");
        }}
        className="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
      >
        📋 Copier toutes les URLs
      </button>
    </div>
  );
};

export default DebugURLPanel;