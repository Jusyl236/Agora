# 🚀 GUIDE COMPLET - Upload manuel vers GitHub Agora

**Pour** : Julien "Le Barman" Chauvin  
**Objectif** : Mettre tout le code sur GitHub Agora

---

## 📋 MÉTHODE 1 : Via GitHub Desktop (PLUS FACILE)

### Étape 1 : Télécharger GitHub Desktop
- Windows/Mac : https://desktop.github.com/
- Installez et connectez-vous avec votre compte GitHub

### Étape 2 : Créer le repo Agora
1. Dans GitHub Desktop : **File** → **New Repository**
2. Nom : `Agora`
3. Local Path : Choisissez un dossier (ex: `Documents/`)
4. Cliquez **Create Repository**

### Étape 3 : Copier les fichiers
1. Je vais créer une archive simple à télécharger
2. Décompressez l'archive
3. Copiez TOUS les fichiers dans le dossier `Agora/` créé par GitHub Desktop

### Étape 4 : Commit et Push
1. Dans GitHub Desktop, vous verrez tous les fichiers dans "Changes"
2. En bas à gauche : 
   - Summary : `Application Café Virtuel V2.0`
   - Description : `Backend + Frontend + Extension Chrome complète`
3. Cliquez **Commit to main**
4. Cliquez **Publish repository** (en haut)
5. **DÉCOCHEZ** "Keep this code private" (pour l'instant)
6. Cliquez **Publish repository**

✅ **TERMINÉ !** Votre code est sur GitHub !

---

## 📋 MÉTHODE 2 : Via Terminal (pour experts)

### Si vous êtes sur Windows :
```bash
# 1. Créer un dossier
mkdir C:\Users\VotreNom\Documents\Agora
cd C:\Users\VotreNom\Documents\Agora

# 2. Initialiser Git
git init
git branch -M main

# 3. Copier les fichiers (je vous fournirai une archive)

# 4. Ajouter et committer
git add .
git commit -m "Application Café Virtuel V2.0 complète"

# 5. Connecter au repo GitHub
git remote add origin https://github.com/Jusyl236/Agora.git

# 6. Push
git push -u origin main
```

### Si vous êtes sur Mac/Linux :
```bash
# 1. Créer un dossier
mkdir ~/Documents/Agora
cd ~/Documents/Agora

# 2. Initialiser Git
git init
git branch -M main

# 3. Copier les fichiers (je vous fournirai une archive)

# 4. Ajouter et committer
git add .
git commit -m "Application Café Virtuel V2.0 complète"

# 5. Connecter au repo GitHub
git remote add origin https://github.com/Jusyl236/Agora.git

# 6. Push
git push -u origin main
```

---

## 📋 MÉTHODE 3 : Via l'interface web GitHub (manuel mais sûr)

1. Créez le repo Agora sur GitHub (https://github.com/new)
2. Cliquez **"uploading an existing file"**
3. Glissez-déposez les fichiers (je vais les organiser pour vous)
4. Commit

**Note** : GitHub limite à 100 fichiers par upload, donc il faudra faire plusieurs fois.

---

## ❓ QUELLE MÉTHODE PRÉFÉREZ-VOUS ?

Dites-moi et je vous prépare exactement ce qu'il faut !

**Recommandation** : GitHub Desktop (Méthode 1) est la plus simple si vous n'êtes pas habitué à Git.

---

*Créé avec 💜 par Emergent E1*
