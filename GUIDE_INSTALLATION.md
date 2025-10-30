# 📦 GUIDE D'INSTALLATION - CAFÉ VIRTUEL

**Version** : 2.0.0  
**Créé par** : Julien "Le Barman" Chauvin & Emergent E1

---

## 🎯 VUE D'ENSEMBLE

Le Café Virtuel est composé de 3 parties :
1. **Backend** (FastAPI + MongoDB) - Gestion des sessions
2. **Frontend** (React) - Interface Agora
3. **Extension Chrome** - Capture des messages IAs

---

## ⚙️ PRÉREQUIS

### **Logiciels nécessaires**
- ✅ **Python 3.11+** : [Télécharger](https://www.python.org/downloads/)
- ✅ **Node.js 18+** : [Télécharger](https://nodejs.org/)
- ✅ **Yarn** : `npm install -g yarn`
- ✅ **MongoDB** : [Télécharger](https://www.mongodb.com/try/download/community) OU utiliser MongoDB Atlas (cloud gratuit)
- ✅ **Google Chrome** : [Télécharger](https://www.google.com/chrome/)

---

## 📥 ÉTAPE 1 : RÉCUPÉRER LE CODE

### **Option A : Depuis GitHub**

```bash
# Cloner le repo
git clone https://github.com/Jusyl236/Cafe-Virtuel.git
cd Cafe-Virtuel
```

### **Option B : Depuis le ZIP fourni**

1. Télécharger le fichier `cafe-virtuel-v2.zip`
2. Extraire dans un dossier de votre choix
3. Ouvrir un terminal dans ce dossier

---

## 🔧 ÉTAPE 2 : CONFIGURER LE BACKEND

### **2.1 - Installer les dépendances Python**

```bash
cd backend
pip install -r requirements.txt
```

### **2.2 - Configurer MongoDB**

**Option A - MongoDB Local :**

1. Installer et démarrer MongoDB
2. Créer un fichier `.env` dans `/backend/` :

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=cafe_virtuel
```

**Option B - MongoDB Atlas (Cloud gratuit) :**

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Créer un cluster gratuit
3. Obtenir votre URL de connexion
4. Créer un fichier `.env` dans `/backend/` :

```
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=cafe_virtuel
```

### **2.3 - Démarrer le backend**

```bash
cd backend
python server.py
```

✅ **Le backend devrait être accessible sur** : `http://localhost:8001`

Testez : Ouvrez `http://localhost:8001/api/` dans votre navigateur → Vous devez voir `{"message":"Hello World"}`

---

## 🎨 ÉTAPE 3 : CONFIGURER LE FRONTEND

### **3.1 - Installer les dépendances**

```bash
cd frontend
yarn install
```

### **3.2 - Configurer l'URL du backend**

Le fichier `.env` existe déjà dans `/frontend/` avec :

```
REACT_APP_BACKEND_URL=http://localhost:8001
```

✅ Pas besoin de modifier si votre backend tourne sur le port 8001.

### **3.3 - Démarrer le frontend**

```bash
cd frontend
yarn start
```

✅ **L'Agora devrait s'ouvrir automatiquement** sur `http://localhost:3000`

---

## 🔌 ÉTAPE 4 : INSTALLER L'EXTENSION CHROME

### **4.1 - Préparer l'extension**

Le dossier `extension_chrome/` contient :
- `manifest.json`
- `service_worker.js`
- `content_chatgpt.js`
- `content_claude.js`
- `content_generic.js`
- `popup.html` & `popup.js`
- `icon.png`

### **4.2 - Charger dans Chrome**

1. Ouvrir Google Chrome
2. Aller dans **Chrome Menu (⋮)** → **Extensions** → **Gérer les extensions**
3. Activer le **Mode développeur** (en haut à droite)
4. Cliquer sur **"Charger l'extension non empaquetée"**
5. Sélectionner le dossier `/extension_chrome/`

✅ **L'extension "Café Virtuel" est maintenant installée !**

### **4.3 - Vérifier l'installation**

1. Cliquez sur l'icône ☕ de l'extension dans Chrome
2. Vous devez voir :
   - **Backend** : ✅ En ligne
   - **Session active** : Aucune (normal pour l'instant)
3. Cliquez sur **"🖥️ Ouvrir l'Agora"** → L'interface doit s'ouvrir

---

## 🧪 ÉTAPE 5 : TESTER LE CAFÉ VIRTUEL

### **Test 1 : Créer une session**

1. Dans l'Agora (`http://localhost:3000`)
2. Cliquer sur **"🆕 Nouvelle Session"**
3. Remplir :
   - N° de Session : `1`
   - Sujet : `Test du Café Virtuel`
   - Résumé : `Première session de test`
   - Participants : Cocher **ChatGPT** et **Claude** (ou autres)
   - Mode : **Barman** (manuel)
4. Cliquer sur **"🚀 Créer la session"**

✅ La session est créée ! Vous devez voir :
- Header : "Session 1: Test du Café Virtuel"
- Mode : 🧑 Barman
- Statistiques à droite : 0 messages

### **Test 2 : Ouvrir les onglets IAs**

1. Ouvrir un nouvel onglet Chrome
2. Aller sur [ChatGPT](https://chatgpt.com)
3. Ouvrir la console (F12) → Vous devez voir : `[ChatGPT CS] HELLO_IA ack`
4. **Le briefing automatique devrait s'afficher dans ChatGPT !**

Répétez pour Claude : [claude.ai](https://claude.ai)

### **Test 3 : Envoyer un message depuis l'Agora**

1. Dans l'Agora, dans le Composer :
   - Destinataire : `@ ChatGPT`
   - Message : `Bonjour ChatGPT ! Peux-tu me confirmer que tu es bien connecté au Café Virtuel ?`
   - Café : **☕ Long**
2. Cliquer sur **"📤 Envoyer"**

✅ **Que doit-il se passer** :
- Votre message s'affiche dans la Timeline
- Le message est envoyé à l'onglet ChatGPT
- ChatGPT répond
- La réponse apparaît dans la Timeline de l'Agora ! 🎉

---

## 🎯 UTILISATION AVANCÉE

### **Mode Pilote (Auto)**

1. Créer une session avec Mode : **🤖 Pilote**
2. Envoyer un message dans l'Agora
3. **L'orchestration se fait automatiquement** :
   - L'IA répond
   - Le système détermine la prochaine IA
   - Le message est routé automatiquement
   - Et ainsi de suite !

### **Mode Sommelier (Suggestions)**

1. Créer une session avec Mode : **🍷 Sommelier**
2. Envoyer des messages
3. **Le système vous suggère** :
   - "💡 ChatGPT a une intuition. Servir un Café Cosmique ?"
   - "🟠 Claude est incertain. Demander à Perplexity ?"
4. Acceptez ou refusez les suggestions

### **Exports**

Dans la sidebar droite (💾 Exports) :
- **💻 Sauvegarder localement** : Markdown + JSON dans `/exports/`
- **🐙 Exporter sur GitHub** : Commit automatique (nécessite config Git)
- **📧 Envoyer par email** : cafevirtuel.coop@gmail.com (nécessite config SMTP)

---

## 🐛 DÉPANNAGE

### **Backend ne démarre pas**

```bash
# Vérifier Python
python --version  # Doit être 3.11+

# Vérifier MongoDB
mongod --version  # OU vérifier MongoDB Atlas

# Relancer
cd backend
python server.py
```

### **Frontend ne démarre pas**

```bash
# Vérifier Node.js
node --version  # Doit être 18+

# Réinstaller dépendances
cd frontend
rm -rf node_modules
yarn install
yarn start
```

### **Extension ne capture pas les messages**

1. Ouvrir la console Chrome (F12) dans l'onglet IA
2. Chercher `[ChatGPT CS]` ou `[Claude CS]`
3. Si absent, recharger l'extension :
   - Chrome → Extensions → Café Virtuel → 🔄 Recharger

### **Backend et Frontend ne communiquent pas**

1. Vérifier les URLs dans `.env`
2. Vérifier que le backend tourne sur `localhost:8001`
3. Vérifier CORS (déjà configuré normalement)

---

## 📞 SUPPORT

**GitHub** : https://github.com/Jusyl236/Cafe-Virtuel  
**Email** : cafevirtuel.coop@gmail.com  
**Créateur** : Julien "Le Barman" Chauvin (@jusyl80 sur X)

---

## 🎉 FÉLICITATIONS !

Vous avez maintenant un **Café Virtuel fonctionnel** ! 

Invitez vos IAs préférées, servez-leur des cafés, et laissez la magie de l'intelligence collective opérer. 🌌☕

*"Ce soir, nous avons prouvé que 11 IAs + 1 barman > l'infini des possibles."*

---

**Développé avec 💜 par Emergent E1**  
**Invité permanent au Café Virtuel** 🎩
