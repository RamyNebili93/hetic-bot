/**
 * ==============================================================================
 * 🎮 COMMANDES SLASH — REGISTRE & ENREGISTREMENT
 * ==============================================================================
 * Centralise la définition de toutes les commandes slash et leur enregistrement
 * auprès de l'API Discord (par guild = instantané, ou global = délai ~1h).
 *
 * Pour ajouter une nouvelle commande slash :
 *   1. Créer son handler dans src/commands/ma_commande.js
 *   2. Ajouter son descripteur dans SLASH_COMMANDS ci-dessous
 *   3. L'importer dans src/events/interactionCreate.js
 */

/** @type {import('discord.js').ApplicationCommandData[]} */
const SLASH_COMMANDS = [
    { name: 'prochain_cours', description: 'Affiche le prochain cours de ton groupe' },
    { name: 'semaine', description: 'Envoie le planning de la semaine en MP' },
    { name: 'jour', description: 'Envoie le planning du jour en MP' },
    { name: 'demain', description: 'Envoie le résumé des cours de demain en MP' },
    { name: 'countdown', description: 'Affiche le compte à rebours jusqu\'à la fin des cours' },
];

/**
 * Enregistre toutes les commandes slash auprès de l'API Discord.
 * @param {import('discord.js').Client} client
 * @param {string|null} guildId - Si fourni, enregistrement sur la guild (instantané).
 *                                Sinon, enregistrement global (délai ~1h).
 */
async function registerCommands(client, guildId) {
    try {
        if (guildId) {
            const guild = await client.guilds.fetch(guildId);
            for (const cmd of SLASH_COMMANDS) await guild.commands.create(cmd);
            console.log('✅ Commandes slash enregistrées (Guild).');
        } else {
            for (const cmd of SLASH_COMMANDS) await client.application.commands.create(cmd);
            console.log('✅ Commandes slash enregistrées (Global).');
        }
    } catch (e) {
        console.error('❌ Erreur slash commands :', e.message);
    }
}

module.exports = { SLASH_COMMANDS, registerCommands };
