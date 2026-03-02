/**
 * ==============================================================================
 * ⚡ ÉVÉNEMENT : interactionCreate — Routeur Slash Commands
 * ==============================================================================
 * Reçoit toutes les interactions Discord et les distribue au bon handler.
 *
 * ⚠️ CORRECTIF CRITIQUE : La gestion d'erreur globale vérifie si l'interaction
 * a déjà reçu un deferReply() avant de tenter editReply(), pour éviter une
 * exception "Unknown interaction" si la commande a planté après le defer.
 *
 * Pour ajouter une commande slash :
 *   1. Créer son handler src/commands/ma_commande.js
 *   2. L'importer ici et l'ajouter dans COMMAND_HANDLERS
 *   3. Ajouter son descripteur dans src/commands/index.js
 */
const { handleDemain } = require('../commands/demain');
const { handleJour } = require('../commands/jour');
const { handleSemaine } = require('../commands/semaine');
const { handleProchainCours } = require('../commands/prochain_cours');
const { handleCountdown } = require('../commands/countdown');

/**
 * Table de routing : nom de commande → handler.
 * @type {Object.<string, Function>}
 */
const COMMAND_HANDLERS = {
    demain: handleDemain,
    jour: handleJour,
    semaine: handleSemaine,
    prochain_cours: handleProchainCours,
    countdown: handleCountdown,
};

/**
 * Attache l'événement 'interactionCreate' au client Discord.
 * @param {import('discord.js').Client} client
 */
function registerInteractionCreateEvent(client) {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const handler = COMMAND_HANDLERS[interaction.commandName];
        if (!handler) return;

        try {
            await handler(interaction);
        } catch (err) {
            console.error(`❌ [Slash] Erreur sur /${interaction.commandName} :`, err.message);
            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply('❌ Une erreur est survenue.');
                } else {
                    await interaction.reply({ content: '❌ Une erreur est survenue.', flags: 64 });
                }
            } catch (_) {
                // L'interaction est expirée, on ignore
            }
        }
    });
}

module.exports = { registerInteractionCreateEvent };
