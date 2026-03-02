# 🤖 HETIC Bot — Discord Planning Bot

Bot Discord qui envoie des rappels de cours et des plannings hebdomadaires aux étudiants HETIC, organisés par groupe.

---

## 📁 Architecture du projet

```
hetic-bot/
├── index.js                        ← Point d'entrée (~20 lignes, ne fait que connecter)
│
├── src/
│   ├── config.js                   ← Toutes les constantes & variables d'environnement
│   ├── client.js                   ← Instance unique du Client Discord
│   │
│   ├── utils/
│   │   └── helpers.js              ← Fonctions utilitaires pures (parseSummary, extractGroup…)
│   │
│   ├── services/
│   │   └── calendarService.js      ← Chargement iCal, cache événements, sentKeys
│   │
│   ├── controllers/
│   │   ├── reminders.js            ← Envoi des rappels 20min avant le cours
│   │   └── digest.js               ← Envoi du digest quotidien (18h00)
│   │
│   ├── commands/
│   │   ├── index.js                ← Registre des commandes + registerCommands()
│   │   ├── demain.js               ← Handler /demain
│   │   ├── jour.js                 ← Handler /jour
│   │   ├── semaine.js              ← Handler /semaine
│   │   └── prochain_cours.js       ← Handler /prochain_cours
│   │
│   └── events/
│       ├── ready.js                ← Boot : calendriers + commandes + crons
│       ├── messageCreate.js        ← !test_digest, !test_rappel (admin)
│       └── interactionCreate.js    ← Routeur des commandes slash
│
├── tests/
│   ├── helpers.test.js             ← 24 tests unitaires (squashSpaces, parseSummary…)
│   └── calendarService.test.js     ← 5 tests unitaires (getNextEvent)
│
├── jest.config.js
├── package.json
├── .env                            ← Variables d'environnement (NON commité)
└── .env.exemple                    ← Template des variables d'environnement
```

---

## 🚀 Installation & Démarrage

```bash
# 1. Cloner et installer les dépendances
npm install

# 2. Copier le template d'environnement
cp .env.exemple .env
# Remplir les valeurs dans .env

# 3. Lancer en mode développement (serveur de test)
npm run dev

# 4. Lancer en production
NODE_ENV=production npm start
```

---

## ⚙️ Variables d'environnement

| Variable | Description | Requis |
|---|---|---|
| `DISCORD_TOKEN` | Token du bot Discord | ✅ |
| `NODE_ENV` | `development` ou `production` | ✅ |
| `GUILD_ID` | ID du serveur Discord de production | production |
| `CHANNEL_ID` | ID du salon de production | production |
| `TEST_GUILD_ID` | ID du serveur de test | development |
| `TEST_CHANNEL_ID` | ID du salon de test | development |
| `TIMEZONE` | Fuseau horaire (défaut: `Europe/Paris`) | ❌ |
| `ICS_URL_GROUPE1` | URL iCal du groupe Dev Web / PGE | ✅ |
| `ICS_URL_GROUPE2` | URL iCal du groupe Data&AI / Marketing | ✅ |
| `ICS_URL_PM` | URL iCal du groupe PM | ✅ |
| `ROLE_ID_DEV_WEB` | ID du rôle Discord "Developper Web" | ✅ |
| `ROLE_ID_PGE` | ID du rôle Discord "PGE" | ✅ |
| `ROLE_ID_DATA_AI` | ID du rôle Discord "Data&AI" | ✅ |
| `ROLE_ID_MARKETING` | ID du rôle Discord "Marketing" | ✅ |
| `ROLE_ID_PM` | ID du rôle Discord "PM" | ✅ |

> **Astuce dev/prod** : Mets `NODE_ENV=development` dans ton `.env` local. Le bot pointera automatiquement vers `TEST_GUILD_ID` et `TEST_CHANNEL_ID`. En production, mets `NODE_ENV=production`.

---

## 🧪 Tests automatisés

```bash
npm test
```

Les tests couvrent toutes les fonctions utilitaires pures (sans Discord ni HTTP).

---

## ➕ Comment ajouter une nouvelle commande slash

> Exemple : ajouter une commande `/mois` qui envoie le planning du mois

**Étape 1 — Créer le handler**

```js
// src/commands/mois.js
const { EmbedBuilder } = require('discord.js');
const { CONFIG, dayjs } = require('../config');
const { eventsCache } = require('../services/calendarService');
const { extractGroup } = require('../utils/helpers');

async function handleMois(interaction) {
  await interaction.deferReply({ flags: 64 });
  const group = extractGroup(interaction.member?.roles?.cache);
  if (!group) return interaction.editReply("❌ Groupe introuvable.");

  // ... ta logique ici ...

  return interaction.editReply('✅ Planning du mois envoyé en MP !');
}

module.exports = { handleMois };
```

**Étape 2 — Enregistrer la commande dans le registre**

```js
// src/commands/index.js — ajouter dans SLASH_COMMANDS :
{ name: 'mois', description: 'Envoie le planning du mois en MP' },
```

**Étape 3 — Brancher le handler dans le routeur**

```js
// src/events/interactionCreate.js
const { handleMois } = require('../commands/mois');

const COMMAND_HANDLERS = {
  // ... commandes existantes ...
  mois: handleMois,   // ← ajouter ici
};
```

**Étape 4 — Redémarrer le bot** pour que les nouvelles commandes s'enregistrent.

---

## ➕ Comment ajouter une nouvelle fonction utilitaire

**Étape 1 — Ouvrir `src/utils/helpers.js`** et ajouter ta fonction avec une JSDoc :

```js
/**
 * Description de ce que fait la fonction.
 * @param {string} param - Description du paramètre
 * @returns {string}
 */
function maFonction(param) {
  // ta logique ici
  return result;
}

// Penser à l'exporter en bas du fichier :
module.exports = { ..., maFonction };
```

**Étape 2 — Importer** la fonction dans le module qui en a besoin :

```js
const { maFonction } = require('../utils/helpers');
```

**Étape 3 — Écrire un test** dans `tests/helpers.test.js` :

```js
describe('maFonction', () => {
  test('fait ce que j\'attends', () => {
    expect(maFonction('input')).toBe('output attendu');
  });
});
```

---

## 📋 Commandes disponibles

| Commande | Visibilité | Description |
|---|---|---|
| `/prochain_cours` | Publique (salon) | Affiche le prochain cours du groupe |
| `/jour` | Privée (DM) | Planning du jour |
| `/semaine` | Privée (DM) | Planning de la semaine (Lun→Ven) |
| `/demain` | Privée (DM) | Planning du lendemain |
| `!test_digest` | Admin, DM | Génère un aperçu du digest |
| `!test_rappel` | Admin, DM | Génère un faux rappel de test |
