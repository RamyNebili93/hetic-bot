🚀 BOT Discord – Projet Étudiant HETIC

Bienvenue dans le dépôt du Bot Discord que j’ai développé dans le cadre de mon apprentissage du développement web et de l’automatisation.

Ce projet a deux objectifs :

Améliorer l’expérience étudiante (rappels de cours, automatisations utiles).

Apprendre la logique d’un bot via Node.js, Discord.js et des automatisations simples.

📚 Fonctionnalités principales
✅ Rappels automatiques de cours

Le bot envoie une notification 10 minutes avant chaque cours.

Heure du cours

Salle

Nom du cours

Format de la notification personnalisée

⚙️ Commandes étudiantes (selon ton code)

Afficher l’emploi du temps

Avoir ses prochains cours

Tester une notification

Ping / help

🔄 Automatisations étudiantes

Le bot permet d’ajouter des petites automatisations simples pour la vie étudiante, par exemple :

Rappels réguliers

Infos pratiques

Messages programmés

🛠️ Technologies utilisées

Node.js

Discord.js

Cron / Scheduler (selon ta logique de rappel)

dotenv pour gérer les variables secrètes

Git / GitHub pour le versioning du projet

⚙️ Comment installer le projet
1. Cloner le repo
git clone https://github.com/ton-utilisateur/ton-repo.git
cd ton-repo

2. Installer les dépendances
npm install

3. Configurer les variables d’environnement

Créer un fichier .env :

TOKEN=ton_token_discord
CLIENT_ID=ton_client_id
GUILD_ID=ton_guild_id

4. Lancer le bot
node index.js


Le bot est maintenant actif sur ton serveur Discord 🎉

🔔 Comment tester les notifications

Pour tester une notification :

Utilise la commande prévue dans ton bot (ex : /testnotif si tu l’as créée)

OU modifie temporairement l’horaire d’un cours pour qu’il se déclenche dans 1 à 2 minutes

Vérifie que ton téléphone a bien les notifications Discord activées

📌 Idées d’amélioration (Roadmap)
🟢 Faciles

Message de bienvenue aux nouveaux arrivants

Commande /cours qui liste la journée

Ajout d’emojis pour rendre les messages plus visuels

🟡 Intermédiaires

Système de préférences (activer/désactiver des rappels)

Notifs personnalisées par utilisateur

Liaison avec un fichier JSON pour enregistrer l’emploi du temps

🔵 Avancées (mais possibles)

Dashboard web pour gérer les rappels

Synchronisation avec Google Calendar

Bot connecté à un mini système d’IA pour expliquer les cours

✨ Objectif pédagogique

Ce projet m’a appris à :

Manipuler Discord.js

Utiliser des APIs

Gérer des tâches programmées

Structurer un projet Node.js

Versionner un projet avec Git/GitHub

👤 Auteur

Ton prénom / pseudo
Étudiant en Bachelor Développement Web – HETIC
Passionné par l’automatisation, les bots et l’apprentissage du code.
