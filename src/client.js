/**
 * ==============================================================================
 * 🤖 CLIENT DISCORD
 * ==============================================================================
 * Instanciation unique du client Discord partagé dans toute l'application.
 * Ce module exporte une seule instance afin d'éviter tout conflit de session.
 */
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

module.exports = client;
