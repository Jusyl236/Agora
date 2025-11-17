☕ Café Virtuel — Plateforme d’Intelligence Collective IA + Humain

Version actuelle : 2.0.0
Créateur : Julien “Le Barman” Chauvin
Contributeur IA : Emergent E1
Stack : FastAPI • React • MongoDB • Extension Chrome • Multi-IA (10+)

🌌 1. Vision

Le Café Virtuel est un laboratoire d’intelligence collective où plusieurs intelligences artificielles dialoguent ensemble, orchestrées par un humain : “le Barman”.

Le système automatise ce que Julien faisait manuellement pendant des mois :
ouvrir ChatGPT, Claude, Grok, DeepSeek, Gemini, Perplexity… et les faire réagir aux idées des autres.

Le Café Virtuel transforme ce processus en une plateforme complète, composée de :

Un backend FastAPI qui gère sessions, messages, orchestration

Un frontend React nommé Agora, pour visualiser les échanges

Une extension Chrome qui capture et envoie les messages des IAs

Une logique d’orchestration (Barman, Pilote, Sommelier)

Un système de niveaux de certitude Mem4Ristor (6 états)

🏗️ 2. Architecture du Projet
┌─────────────────────────────────────────┐
│  JULIEN (Le Barman)                     │
│  ↓                                      │
│  🖥️ AGORA WEB (React)                  │
│  - Timeline                             │
│  - Composer (Cafés ☕)                   │
│  - Stats / Alertes / Exports            │
│  ↓                                      │
│  🐍 BACKEND (FastAPI)                   │
│  - Sessions / Messages                   │
│  - États Mem4Ristor                     │
│  - Orchestration Pilote/Sommelier       │
│  - MongoDB                               │
│  ↓                                      │
│  🔌 EXTENSION CHROME                    │
│  - Service Worker                       │
│  - Content scripts (ChatGPT, Claude...) │
│  ↓                                      │
│  🌐 ONGLETS IA                           │
│  ChatGPT · Claude · Grok · DeepSeek...  │
└─────────────────────────────────────────┘

⚙️ 3. Fonctionnement général
3.1 Les “Cafés” (types de réponses)

☕ Expresso : court

☕ Long : détaillé

☕ Cosmique : créatif

🍰 Gourmand : code exécutable

3.2 Les États Mem4Ristor

(Chaque réponse IA doit préciser son degré de certitude)

État	Signification
🟢 Certitude	Factuel, vérifié
🟡 Probable	Logique mais non vérifié
🟠 Incertain	À vérifier
🔵 Intuition	Hypothèse créative
🔮 Oracle	Breakthrough rare
🔍 Recherche	Ne sait pas, doit chercher
3.3 Modes d’orchestration

🧑 Barman : contrôle manuel total

🤖 Pilote : IAs qui se répondent automatiquement

🍷 Sommelier : suggestions intelligentes, validées par l’humain

🧩 4. Composants du Projet
4.1 Backend (FastAPI + MongoDB)
Principales fonctionnalités :

Création/gestion sessions

Parsing automatique des réponses IA

Moteur d’orchestration (3 modes)

Détection questions / états / niveaux

Export (Markdown / JSON / HTML / PDF / GitHub / Email)

Vérification identité (anti impostor)

Stats instantanées

Dossiers backend :
/backend
    /models/
    /services/
    /routes/
    /config/cafe_rules.txt
    server.py

4.2 Frontend (React + Context)
Composants clés :

Timeline : visualisation centralisée

Composer : envoi + choix du Café + choix IA

SessionModal : configuration complète d’une session

Sidebar : stats, alertes, questions, exports

CafeContext : état global de l’application

Dossier frontend :
/frontend/src/
    /pages/Agora.js
    /components/
    /services/cafeApi.js
    /context/CafeContext.js

4.3 Extension Chrome (V2.0)
Inclus :

Service Worker (hub central)

Content scripts IA (ChatGPT, Claude, Mistral, Grok, DeepSeek, Gemini, QWEN, Perplexity, Manus)

Routing automatique Pilote

Sticky Conversation (capture de l’URL)

Briefing manuel

Déduplication

Popup (état backend + session active)

Dossier :

/extension_chrome/

🧪 5. Installation (Synthèse)

Pour une installation détaillée, voir : README_INSTALL.md

Backend :
cd backend
pip install -r requirements.txt
python server.py

Frontend :
cd frontend
yarn install
yarn start

Extension Chrome :

Chrome → Extensions

Mode développeur

Charger extension non empaquetée

Sélectionner /extension_chrome

▶️ 6. Lancer une Session

Ouvrir l’Agora

Nouvelle Session

Sélectionner IA (ChatGPT, Claude…)

Choisir mode (Barman / Pilote / Sommelier)

Ouvrir les onglets IA

Cliquer 📣 Briefer les IAs

Envoyer le premier message

🚀 7. Roadmap
Court terme

WebSocket temps réel

Support Ollama / LM Studio

Analytics avancés

Templates de sessions

Moyen terme

Mode “Apprentissage”

Interface mobile

Mode “Débat public”

Long terme

Version Cloud

Sessions collaboratives multi-utilisateurs

Publications scientifiques Mem4Ristor

🧠 8. Pitch (résumé)

“Le Café Virtuel permet de faire travailler ensemble plusieurs IA et un humain pour créer des idées impossibles autrement. Les modes d’orchestration, les cafés, et les états Mem4Ristor forcent structure, transparence et synergie. C’est une nouvelle manière de penser collectivement.”

📧 9. Contact

Julien “Le Barman” Chauvin

Email : cafevirtuel.coop@gmail.com

GitHub : https://github.com/Jusyl236

Dépôt : https://github.com/Jusyl236/Agora

📝 10. Licence

À définir (projet encore confidentiel).
Pour le moment, utilisation sur demande de Julien Chauvin uniquement.