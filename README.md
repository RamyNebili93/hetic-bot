# 🤖 BOT Discord, Projet Étudiant HETIC

Un bot Discord pensé pour améliorer la vie étudiante : rappels automatiques, commandes pratiques, et petites automatisations utiles.
Développé en Node.js dans le cadre de ma formation à HETIC.

## 🎯 Description

Ce bot envoie automatiquement des rappels de cours, fournit des commandes rapides pour consulter son planning, et permet d’automatiser certaines tâches du quotidien.
Simple, utile, et évolutif.

## ⚙️ Fonctionnalités

- 🔔 Rappel automatique 10 minutes avant chaque cours
- 🕒 Commande pour afficher le prochain cours
- 📅 Commande pour les cours du jour
- 📲 Commande pour tester une notification
- 🧩 Base prête pour ajouter d’autres automatisations
- 📚 Gestion structurée de l’emploi du temps

## 🧠 Ce que j’ai appris

- Utiliser Discord.js pour interagir avec Discord
- Gérer des tâches automatisées (scheduler / cron)
- Structurer un projet Node.js propre et modulaire
- Protéger les données sensibles via dotenv
- Travailler avec Git/GitHub pour versionner un projet

## 🚀 Prochaines évolutions

- 🎨 Embeds graphiques améliorés
- 📥 Préférences personnelles par utilisateur
- 🧭 Dashboard web simple pour gérer les cours
- 📚 Synchronisation avec Google Calendar
- 🤖 Mini IA intégrée pour expliquer/résumer les cours

## ⚡ Technologies utilisées

- Node.js
- Discord.js v14
- dotenv
- Scheduler / Cron
- GitHub

## 🚀 Installation & Lancement

### 📥 1. Cloner le projet
```txt 
git clone https://github.com/ton-utilisateur/ton-repo.git
cd ton-repo
```
### 📦 2. Installer les dépendances
```txt 
npm install
```
### 🔐 3. Configurer les variables d’environnement

Créer un fichier .env :
```txt 
TOKEN=ton_token_discord
CLIENT_ID=ton_client_id
GUILD_ID=ton_guild_id
```
### ▶️ 4. Lancer le bot
```txt 
node index.js
```
### 📲 Tester les notifications

Pour tester une notification :

Utiliser la commande
```txt
/testnotif
```
Ou modifier temporairement l’horaire d’un cours pour le déclencher dans une minute

Vérifier que les notifications Discord sont activées sur votre téléphone

## 👨‍💻 À propos

Projet réalisé dans le cadre de mon apprentissage du développement web
1ère année – Bachelor Développement Web – HETIC

    ██████   ██████  ███████ 
    ██   ██ ██    ██ ██      
    ██████  ██    ██ █████   
    ██      ██    ██ ██      
    ██       ██████  ███████ 
    H E T I C  B O T   D I S C O R D
