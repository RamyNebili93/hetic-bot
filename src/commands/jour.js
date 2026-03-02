/**
 * ==============================================================================
 * 🎮 COMMANDE : /jour
 * ==============================================================================
 * Envoie le planning du jour courant en DM à l'utilisateur.
 * Filtre les créneaux de 12h30 (pause déjeuner) pour ne garder que les cours.
 */
const { EmbedBuilder } = require('discord.js');
const { CONFIG, dayjs } = require('../config');
const { eventsCache } = require('../services/calendarService');
const { parseSummary, extractGroup, getGroupDisplayName } = require('../utils/helpers');

/**
 * Handler de la commande slash /jour.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function handleJour(interaction) {
    await interaction.deferReply({ flags: 64 });
    const group = extractGroup(interaction.member?.roles?.cache);
    if (!group) return interaction.editReply("❌ Groupe introuvable (Rôles manquants).");

    const now = dayjs().tz(CONFIG.TIMEZONE);
    const dayEvents = eventsCache[group]?.filter(ev => {
        const isSameDay = ev.start.isSame(now, 'day');
        const isLunch = (ev.start.hour() === 12 && ev.start.minute() === 30);
        return isSameDay && !isLunch;
    }) || [];

    if (dayEvents.length === 0) return interaction.editReply('Aucun cours aujourd\'hui.');

    const embed = new EmbedBuilder()
        .setColor(0xF39C12)
        .setTitle(`📅 Cours du jour (${getGroupDisplayName(group)})`)
        .setTimestamp();

    for (const ev of dayEvents) {
        const { course, prof } = parseSummary(ev.summary, ev.description);
        let location = (ev.location || 'Inconnue').replace(/^salle\s+/i, '');
        const separator = '⎯'.repeat(20);

        embed.addFields({
            name: `⏰ \`${ev.start.format('HH:mm')}\` à \`${ev.end.format('HH:mm')}\``,
            value: `**__${course}__**\n👨‍🏫 **${prof}**\n📍 Salle ${location}\n${separator}`,
            inline: false
        });
    }

    try {
        await interaction.user.send({ embeds: [embed] });
        return interaction.editReply('✅ Planning envoyé en MP !');
    } catch (e) {
        return interaction.editReply('❌ Erreur MP (DMs fermés ?).');
    }
}

module.exports = { handleJour };
