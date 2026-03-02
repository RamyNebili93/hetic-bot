/**
 * ==============================================================================
 * 🚀 POINT D'ENTRÉE — hetic-bot
 * ==============================================================================
 * Ce fichier initialise le bot en chargeant les modules dans l'ordre :
 *   1. Client Discord (src/client.js)
 *   2. Événements (src/events/*.js)
 *   3. Connexion à Discord via client.login()
 *
 * Toute la logique métier est dans /src.
 * Pour déboguer, voir les logs produits par chaque module.
 */
const { CONFIG } = require('./src/config');
const client = require('./src/client');

// Attache tous les événements Discord
const { registerReadyEvent } = require('./src/events/ready');
const { registerMessageCreateEvent } = require('./src/events/messageCreate');
const { registerInteractionCreateEvent } = require('./src/events/interactionCreate');

registerReadyEvent(client);
registerMessageCreateEvent(client);
registerInteractionCreateEvent(client);

// Connexion au bot Discord
client.login(CONFIG.TOKEN).catch(err => {
  console.error('❌ Échec connexion Discord :', err.message);
});