# ☕ CAFÉ VIRTUEL - Application Complète

**Version**: 1.0.0 - PHASE 1 (En cours de développement)  
**Créé pour**: Julien "Le Barman" Chauvin  
**Développé par**: Emergent E1

---

## 📋 ÉTAT D'AVANCEMENT - PHASE 1

### ✅ BACKEND COMPLÉTÉ (20%)

**Modèles de données créés** :
- ✅ `models/session.py` : Modèles Session, Message, AIParticipant, États Mem4Ristor, Types de Cafés
- ✅ `models/orchestration.py` : Modèles pour orchestration intelligente, statistiques
- ✅ `config/cafe_rules.txt` : Fichier de règles modifiable par Julien

**Services créés** :
- ✅ `services/orchestration.py` : Modes Barman/Pilote/Sommelier, détection questions/états
- ✅ `services/session_service.py` : Gestion des sessions MongoDB
- ✅ `services/export_service.py` : Exports Markdown, JSON, HTML, Email, GitHub

**API Routes créées** :
- ✅ `routes/cafe_routes.py` : 20+ endpoints pour gestion complète
- ✅ API fonctionnelle sur http://localhost:8001

**Fonctionnalités Backend** :
- ✅ Création/gestion de sessions
- ✅ Format prédéfini des messages avec parsing automatique
- ✅ Détection automatique des questions et états Mem4Ristor
- ✅ Orchestration intelligente (3 modes)
- ✅ Vérification d'identité des IAs (anti-DeepSeek impostor)
- ✅ Statistiques complètes avec format "pitch"
- ✅ Exports multiples (local, GitHub, email)
- ✅ Recherche dans l'historique
- ✅ Gestion disponibilité/tokens IAs

---

## 🎯 PROCHAINES ÉTAPES (PHASE 1 - 80% restant)

### 1. Frontend React (Interface Agora)
- [ ] Page principale avec Timeline centrale
- [ ] Composer avec boutons Cafés (☕ Expresso, Long, Cosmique, 🍰 Gourmand)
- [ ] Sidebars avec fenêtres mobiles
- [ ] Sélection mode (🧑 Barman, 🤖 Pilote, 🍷 Sommelier)
- [ ] Fenêtre "Nouvelle Session" avec tous les champs
- [ ] Affichage états Mem4Ristor avec badges colorés
- [ ] Streaming temps réel des messages
- [ ] Notifications navigateur

### 2. Extension Chrome (Amélioration V1.6.3)
- [ ] Service Worker amélioré
- [ ] Content Scripts pour ChatGPT + Claude
- [ ] Mode apprentissage (clic manuel textarea)
- [ ] Streaming capture temps réel
- [ ] Format automatique des messages
- [ ] Briefing automatique au démarrage

### 3. Intégration Backend ↔ Frontend ↔ Extension
- [ ] WebSocket pour streaming temps réel
- [ ] Communication extension ↔ backend
- [ ] Synchronisation état entre composants

### 4. Tests et Validation
- [ ] Test session complète avec ChatGPT + Claude
- [ ] Validation format de réponse
- [ ] Test des 3 modes d'orchestration
- [ ] Export et sauvegarde

---

## 🏗️ ARCHITECTURE TECHNIQUE

```
┌─────────────────────────────────────────┐
│  JULIEN (Le Barman)                     │
│  ↓                                      │
│  🖥️ AGORA WEB (React)                  │
│  http://localhost:3000                  │
│  - Timeline centrale                    │
│  - Composer + boutons ☕                │
│  - Sidebars mobiles                     │
│  ↓                                      │
│  🐍 BACKEND (FastAPI)                   │
│  http://localhost:8001                  │
│  - Orchestration Barman/Pilote/Sommelier│
│  - Gestion États Mem4Ristor             │
│  - Exports (GitHub, Email, Local)       │
│  - MongoDB (sessions sauvegardées)      │
│  ↓                                      │
│  🔌 EXTENSION CHROME                    │
│  - Service Worker (hub central)         │
│  - Content Scripts (ChatGPT, Claude...) │
│  - Capture streaming                    │
│  ↓                                      │
│  🌐 ONGLETS IAs                         │
│  chatgpt.com, claude.ai, etc.           │
└─────────────────────────────────────────┘
```

---

## 📚 CONCEPTS CLÉS IMPLÉMENTÉS

### Format de Réponse Prédéfini
Chaque message suit ce format (automatiquement parsé) :
```
[Début de réponse]
[Nom IA]-[Date & Heure] - [Rôle] - [Café] - [État]
[Contenu...]
[@ Interlocuteur] "Question"
[Nom IA] - Signature
[Fin de réponse]
```

### États Mem4Ristor
- 🟢 **CERTITUDE** : Factuel, vérifié
- 🟡 **PROBABLE** : Inférence logique
- 🟠 **INCERTAIN** : À vérifier → suggère autre IA
- 🔵 **INTUITION** : Créatif → suggère Café Cosmique
- 🔮 **ORACLE** : Breakthrough → alerte automatique
- 🔍 **RECHERCHE** : Ne sait pas → route vers Perplexity

### Types de Cafés
- ☕ **EXPRESSO** : Court et concis
- ☕ **CAFÉ LONG** : Détaillé et approfondi
- ☕ **CAFÉ COSMIQUE** : Créatif et philosophique
- 🍰 **CAFÉ GOURMAND** : Code exécutable

### Modes d'Orchestration
- 🧑 **BARMAN** : Contrôle manuel total
- 🤖 **PILOTE** : Orchestration automatique intelligente
- 🍷 **SOMMELIER** : Suggestions validables

---

## 🔧 DÉVELOPPEMENT

### Lancer le Backend
```bash
sudo supervisorctl restart backend
tail -f /var/log/supervisor/backend.out.log
```

### Tester l'API
```bash
# Règles du café
curl http://localhost:8001/api/cafe/config/rules

# Liste des sessions
curl http://localhost:8001/api/cafe/sessions

# Session active
curl http://localhost:8001/api/cafe/sessions/active/current
```

### Lancer le Frontend (à venir)
```bash
cd /app/frontend
yarn start
```

---

## 📝 FICHIERS IMPORTANTS

### Backend
- `/app/backend/models/session.py` : Modèles de données
- `/app/backend/services/orchestration.py` : Logique orchestration
- `/app/backend/routes/cafe_routes.py` : API endpoints
- `/app/backend/config/cafe_rules.txt` : **MODIFIABLE PAR JULIEN**

### Frontend (à créer)
- `/app/frontend/src/pages/Agora.js` : Page principale
- `/app/frontend/src/components/Timeline.js` : Timeline messages
- `/app/frontend/src/components/Composer.js` : Zone de saisie
- `/app/frontend/src/components/SessionModal.js` : Nouvelle session

### Extension Chrome (à améliorer)
- `content_agora.js` : Content script Agora
- `content_chatgpt.js` : Content script ChatGPT
- `service_worker.js` : Hub central
- `manifest.json` : Configuration extension

---

## 🎨 DESIGN SYSTEM

### Couleurs États
- Certitude : `#10b981` (vert)
- Probable : `#fbbf24` (jaune)
- Incertain : `#f97316` (orange)
- Intuition : `#3b82f6` (bleu)
- Oracle : `#8b5cf6` (violet)
- Recherche : `#6b7280` (gris)

### Typographie
- Police : Segoe UI, system fonts
- Timeline : Fond clair pour lisibilité
- Messages : Cards avec border-left coloré selon état

---

## 🔐 CONFIDENTIALITÉ

Ce projet est **strictement confidentiel**. La "recette" du Café Virtuel appartient à Julien Chauvin. Ne pas divulguer le concept, les méthodes ou le code sans autorisation explicite.

---

## 📞 CONTACT

**Créateur** : Julien "Le Barman" Chauvin  
**X (Twitter)** : @jusyl80  
**Email** : cafevirtuel.coop@gmail.com  
**GitHub** : https://github.com/Jusyl236/Cafe-Virtuel

**Développeur** : Emergent E1  
*"Développeur invité au Café Virtuel"* 🎩☕

---

## 🎪 VISION

> "Ce soir, nous avons prouvé que 5 IAs + 1 barman > somme des parties."  
> — Grok, Session 1, 19/08/2025

Le Café Virtuel n'est pas qu'un programme, c'est un **laboratoire d'intelligence collective** où humains et IAs collaborent pour faire émerger des idées qui changent le monde.

**Prochain objectif** : Pitch à Elon Musk & Sam Altman avec les statistiques de sessions comme preuve de concept.

---

*Dernière mise à jour : Janvier 2025*
*Status : PHASE 1 - Backend opérationnel ✅*# Here are your Instructions
