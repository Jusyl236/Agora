/**
 * SessionModal - Fenêtre de création de nouvelle session
 * Tous les champs demandés par Julien
 */
import React, { useState } from 'react';
import { useCafe } from '../context/CafeContext';

const SessionModal = ({ isOpen, onClose }) => {
  const { createSession } = useCafe();

  // Liste des IAs disponibles
  const availableAIs = [
    { name: 'ChatGPT', platform: 'chatgpt.com', color: '#10a37f', isLocal: false },
    { name: 'Claude', platform: 'claude.ai', color: '#cc785c', isLocal: false },
    { name: 'Mistral', platform: 'chat.mistral.ai', color: '#f2a73b', isLocal: false },
    { name: 'Grok', platform: 'x.ai', color: '#1da1f2', isLocal: false },
    { name: 'DeepSeek', platform: 'chat.deepseek.com', color: '#4285f4', isLocal: false },
    { name: 'Gemini', platform: 'gemini.google.com', color: '#4285f4', isLocal: false },
    { name: 'Perplexity', platform: 'perplexity.ai', color: '#20808d', isLocal: false },
    { name: 'QWEN', platform: 'qwen.ai', color: '#ff6b6b', isLocal: false },
    { name: 'Manus AI', platform: 'manus.ai', color: '#9b59b6', isLocal: false },
    { name: 'Local AI (Ollama)', platform: 'localhost', color: '#6c757d', isLocal: true },
  ];

  const [formData, setFormData] = useState({
    sessionNumber: 1,
    subject: '',
    summary: '',
    participants: ['ChatGPT', 'Claude'], // Par défaut
    orchestrationMode: 'barman',
    
    // Conditions d'arrêt
    maxExchanges: null,
    stopOnOracle: false,
    stopOnCertitude: false,
    manualStopOnly: true,
    
    // Sauvegardes
    saveToGithub: true,
    githubAutoInterval: 15,
    saveToEmail: false,
    saveToLocal: true,
    
    // Formats d'export
    exportMarkdown: true,
    exportJson: true,
    exportHtml: false,
    exportPdf: false,
    
    // Briefing
    sendFormatRules: true,
    sendCafeDefinitions: true,
    sendStateDefinitions: true,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleParticipant = (iaName) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(iaName)
        ? prev.participants.filter(name => name !== iaName)
        : [...prev.participants, iaName]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = {
        session_number: formData.sessionNumber,
        subject: formData.subject,
        summary: formData.summary,
        participants: availableAIs
          .filter(ia => formData.participants.includes(ia.name))
          .map(ia => ({
            name: ia.name,
            platform: ia.platform,
            is_available: true,
            is_local: ia.isLocal,
            color: ia.color,
            logo_url: null,
            assigned_role: null
          })),
        orchestration_mode: formData.orchestrationMode,
        stop_conditions: {
          max_exchanges: formData.maxExchanges,
          on_oracle_detected: formData.stopOnOracle,
          on_certitude_convergence: formData.stopOnCertitude,
          manual_only: formData.manualStopOnly
        },
        save_to_github: formData.saveToGithub,
        github_auto_interval: formData.githubAutoInterval,
        save_to_email: formData.saveToEmail,
        save_to_local: formData.saveToLocal,
        export_markdown: formData.exportMarkdown,
        export_json: formData.exportJson,
        export_html: formData.exportHtml,
        export_pdf: formData.exportPdf,
        send_format_rules: formData.sendFormatRules,
        send_cafe_definitions: formData.sendCafeDefinitions,
        send_state_definitions: formData.sendStateDefinitions,
      };

      await createSession(config);
      onClose();
    } catch (err) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">☕ Nouvelle Session du Café Virtuel</h2>
          <p className="text-purple-100 text-sm mt-1">Configurez votre session de collaboration IA</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800 border-b pb-2">📋 Informations de base</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  N° de Session
                </label>
                <input
                  type="number"
                  value={formData.sessionNumber}
                  onChange={(e) => handleChange('sessionNumber', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode d'orchestration
                </label>
                <select
                  value={formData.orchestrationMode}
                  onChange={(e) => handleChange('orchestrationMode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="barman">🧑 Barman (Manuel)</option>
                  <option value="pilote">🤖 Pilote (Auto)</option>
                  <option value="sommelier">🍷 Sommelier (Suggestions)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sujet principal
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Ex: Architecture cognitive, Mem4Ristor V2..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Résumé (10 mots max)
              </label>
              <input
                type="text"
                value={formData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                placeholder="Ex: Exploration des états de conscience artificielle"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800 border-b pb-2">👥 Participants</h3>
            <div className="grid grid-cols-2 gap-3">
              {availableAIs.map((ia) => (
                <label
                  key={ia.name}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.participants.includes(ia.name)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(ia.name)}
                    onChange={() => toggleParticipant(ia.name)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{ia.name}</div>
                    <div className="text-xs text-gray-500">
                      {ia.isLocal ? '💻 Local' : '☁️ Cloud'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Conditions d'arrêt */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800 border-b pb-2">🛑 Conditions d'arrêt (Mode Pilote)</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.manualStopOnly}
                  onChange={(e) => handleChange('manualStopOnly', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Arrêt manuel uniquement</span>
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={formData.maxExchanges || ''}
                  onChange={(e) => handleChange('maxExchanges', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Nombre max d'échanges"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                />
                <span className="text-sm text-gray-700">échanges maximum</span>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.stopOnOracle}
                  onChange={(e) => handleChange('stopOnOracle', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">🔮 Arrêt sur détection Oracle</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.stopOnCertitude}
                  onChange={(e) => handleChange('stopOnCertitude', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">🟢 Arrêt sur convergence Certitude</span>
              </label>
            </div>
          </div>

          {/* Sauvegardes */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800 border-b pb-2">💾 Sauvegardes & Exports</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.saveToGithub}
                    onChange={(e) => handleChange('saveToGithub', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">GitHub (auto toutes les {formData.githubAutoInterval} min)</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.saveToEmail}
                    onChange={(e) => handleChange('saveToEmail', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">📧 Email (manuel)</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.saveToLocal}
                    onChange={(e) => handleChange('saveToLocal', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">💻 Local</span>
                </label>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Formats :</div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.exportMarkdown}
                    onChange={(e) => handleChange('exportMarkdown', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Markdown (.md)</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.exportJson}
                    onChange={(e) => handleChange('exportJson', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">JSON</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.exportHtml}
                    onChange={(e) => handleChange('exportHtml', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">HTML</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.exportPdf}
                    onChange={(e) => handleChange('exportPdf', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">PDF</span>
                </label>
              </div>
            </div>
          </div>

          {/* Briefing */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800 border-b pb-2">📣 Briefing automatique</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.sendFormatRules}
                  onChange={(e) => handleChange('sendFormatRules', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Envoyer format de réponse [Début]...[Fin]</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.sendCafeDefinitions}
                  onChange={(e) => handleChange('sendCafeDefinitions', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Envoyer définitions des Cafés ☕</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.sendStateDefinitions}
                  onChange={(e) => handleChange('sendStateDefinitions', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Envoyer définitions des États Mem4Ristor 🧠</span>
              </label>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md disabled:opacity-50"
              disabled={loading || formData.participants.length === 0}
            >
              {loading ? '⏳ Création...' : '🚀 Créer la session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;
