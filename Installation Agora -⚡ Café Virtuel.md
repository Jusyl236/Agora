⚡ Café Virtuel — Installation rapide

Ce guide explique comment installer le Café Virtuel en quelques minutes, sans connaissances techniques.

Le Café Virtuel comporte 3 parties :

Backend (serveur)

Frontend (interface Agora)

Extension Chrome (connexion aux IAs)

🟦 1. Prérequis
Logiciels à installer (obligatoires)

Python 3.11+
→ https://www.python.org/downloads/

Node.js 18+
→ https://nodejs.org/

Yarn
→ Ouvrir un terminal et taper :

npm install -g yarn


MongoDB
→ Version locale OU MongoDB Atlas (gratuit)

Google Chrome

C’est tout.

🟩 2. Récupérer le projet
Option A : GitHub (recommandé)
git clone https://github.com/Jusyl236/Agora.git
cd Agora

Option B : Fichier ZIP

Télécharger l’archive ZIP du Café Virtuel

Extraire le contenu sur le bureau

Ouvrir un terminal dans le dossier

🟧 3. Installer le backend

Dans un terminal :

cd backend
pip install -r requirements.txt


Créer un fichier .env à la racine du dossier backend :

Si MongoDB est installé localement :
MONGO_URL=mongodb://localhost:27017
DB_NAME=cafe_virtuel

Si vous utilisez MongoDB Atlas (recommandé) :

Remplacer <username>, <password> et <cluster> par vos valeurs :

MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
DB_NAME=cafe_virtuel

Démarrer le backend :
python server.py


Si tout marche → un message apparaît :
"Backend running on http://localhost:8001
"

🟪 4. Installer le frontend (Agora)

Dans un autre terminal :

cd frontend
yarn install
yarn start


Le site s’ouvre automatiquement :
👉 http://localhost:3000

🟫 5. Installer l’extension Chrome

Ouvrir Google Chrome

Aller dans :
Menu (⋮) → Extensions → Gérer les extensions

Activer Mode développeur (coin supérieur droit)

Cliquer Charger l’extension non empaquetée

Sélectionner le dossier :

/extension_chrome/


L’extension Café Virtuel ☕ apparaît.

🟥 6. Vérification rapide

Cliquer sur l’icône ☕
→ L’extension doit dire :
Backend : 🟢 En ligne

Cliquer sur “🖥️ Ouvrir l’Agora”
→ L’interface s’ouvre sur http://localhost:3000

🟦 7. Premier test (3 minutes)
Étape 1

Ouvrir ChatGPT dans un nouvel onglet :
https://chatgpt.com

Étape 2

Dans l’Agora :

Cliquer Nouvelle Session

Choisir ChatGPT

Mode : Barman

Étape 3

Dans l’Agora, envoyer :

Bonjour ChatGPT, peux-tu confirmer le lien avec le Café Virtuel ?

Étape 4

La réponse apparaît à la fois :

dans l’onglet ChatGPT

dans l’Agora

🎉 Installation réussie !

🟨 8. Dépannage express
❌ Le backend ne démarre pas

→ Python trop ancien
→ MongoDB mal configuré

❌ Le frontend ne démarre pas

→ Node.js trop ancien
→ Réinstaller dépendances :

rm -rf node_modules
yarn install

❌ L’extension ne fait rien

→ L’onglet IA doit être actif
→ Vérifier la console Chrome (F12) :
Vous devez voir :
[ChatGPT CS] HELLO_IA ack

🟩 9. Contact support

En cas de besoin :
📧 cafevirtuel.coop@gmail.com

📦 Dépôt GitHub : https://github.com/Jusyl236/Agora