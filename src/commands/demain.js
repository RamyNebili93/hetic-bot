/**
 * ==============================================================================
 * 🎮 COMMANDE : /demain
 * ==============================================================================
 * Envoie le planning du lendemain en DM à l'utilisateur, pour son groupe uniquement.
 * ⚠️ N'utilise PAS sendDailyDigest() — cette fonction est réservée au cron
 * automatique (18h00) et à la commande admin !test_digest.
 */
const { EmbedBuilder } = require('discord.js');
const { CONFIG, dayjs } = require('../config');
const { eventsCache } = require('../services/calendarService');
const { parseSummary, extractGroup, getGroupDisplayName } = require('../utils/helpers');

/**
 * Handler de la commande slash /demain.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function handleDemain(interaction) {
    await interaction.deferReply({ flags: 64 });

    const group = extractGroup(interaction.member?.roles?.cache);
    if (!group) return interaction.editReply("❌ Groupe introuvable (Rôles manquants).");

    const now = dayjs().tz(CONFIG.TIMEZONE);
    const startOfTomorrow = now.add(1, 'day').startOf('day');
    const endOfTomorrow = now.add(1, 'day').endOf('day');

    const events = eventsCache[group]?.filter(ev =>
        ev.start.isAfter(startOfTomorrow) && ev.start.isBefore(endOfTomorrow)
    ) || [];

    if (events.length === 0) {
        return interaction.editReply('📭 Aucun cours prévu pour demain.');
    }

    const embed = new EmbedBuilder()
        .setColor(0xE67E22)
        .setTitle(`📅 Cours du ${startOfTomorrow.format('dddd DD/MM')} (${getGroupDisplayName(group)})`)
        .setDescription('Voici les cours prévus. Vérifiez les salles !')
        .setTimestamp();

    for (const ev of events) {
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
        return interaction.editReply('✅ Planning de demain envoyé en MP !');
    } catch (e) {
        return interaction.editReply('❌ Erreur MP (DMs fermés ?).');
    }
}

module.exports = { handleDemain };
