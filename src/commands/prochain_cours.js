/**
 * ==============================================================================
 * 🎮 COMMANDE : /prochain_cours
 * ==============================================================================
 * Affiche le prochain cours du groupe de l'utilisateur directement dans le salon
 * (réponse publique, sans DM).
 */
const { EmbedBuilder } = require('discord.js');
const { CONFIG, dayjs } = require('../config');
const { getNextEvent } = require('../services/calendarService');
const { parseSummary, extractGroup } = require('../utils/helpers');

/**
 * Handler de la commande slash /prochain_cours.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function handleProchainCours(interaction) {
    await interaction.deferReply();

    const group = extractGroup(interaction.member?.roles?.cache);
    if (!group) return interaction.editReply("❌ Rôle introuvable.");

    const next = getNextEvent(dayjs().tz(CONFIG.TIMEZONE), group);
    if (!next) return interaction.editReply('Aucun cours à venir.');

    const { course, prof } = parseSummary(next.summary, next.description);
    const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle('📌 Prochain cours')
        .addFields(
            { name: '📅 Jour', value: next.start.format('dddd DD/MM'), inline: true },
            { name: '⏰ Heure', value: next.start.format('HH:mm'), inline: true },
            { name: '🏫 Salle', value: next.location || '—', inline: true },
            { name: '📚 Cours', value: course, inline: false },
            { name: '👨‍🏫 Prof', value: prof, inline: false },
        )
        .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
}

module.exports = { handleProchainCours };
