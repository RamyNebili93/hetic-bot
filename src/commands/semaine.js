/**
 * ==============================================================================
 * 🎮 COMMANDE : /semaine
 * ==============================================================================
 * Envoie le planning de la semaine (Lundi→Vendredi) en DM à l'utilisateur.
 *
 * ⚠️ CORRECTIF CRITIQUE — Limite Discord des 25 fields par embed :
 * Discord refuse les embeds avec plus de 25 fields. Si la semaine est chargée,
 * on découpe automatiquement en plusieurs embeds. La logique de split est
 * préservée à l'identique depuis la version originale.
 */
const { EmbedBuilder } = require('discord.js');
const { CONFIG, dayjs } = require('../config');
const { eventsCache } = require('../services/calendarService');
const { parseSummary, extractGroup, getGroupDisplayName } = require('../utils/helpers');

/**
 * Handler de la commande slash /semaine.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function handleSemaine(interaction) {
    await interaction.deferReply({ flags: 64 });
    const group = extractGroup(interaction.member?.roles?.cache);
    if (!group) return interaction.editReply("❌ Groupe introuvable.");

    const now = dayjs().tz(CONFIG.TIMEZONE);
    const startOfWeek = now.startOf('week').add(1, 'day'); // Lundi
    const endOfWeek = startOfWeek.add(5, 'day');         // Vendredi soir

    const weekEvents = eventsCache[group]?.filter(ev =>
        ev.start.isAfter(startOfWeek) && ev.start.isBefore(endOfWeek)
    ) || [];

    if (weekEvents.length === 0) return interaction.editReply('Aucun cours cette semaine.');

    // Groupement par jour
    const byDay = {};
    for (const ev of weekEvents) {
        const dayKey = ev.start.format('dddd DD/MM');
        if (!byDay[dayKey]) byDay[dayKey] = [];
        const { course, prof } = parseSummary(ev.summary, ev.description);
        byDay[dayKey].push({ ...ev, course, prof });
    }

    // TRI : On s'assure que Lundi passe avant Mardi
    const sortedDays = Object.entries(byDay).sort((a, b) => {
        // a[1][0] est le premier cours du jour "a"
        return a[1][0].start.valueOf() - b[1][0].start.valueOf();
    });

    const embeds = [];
    let currentEmbed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setTitle(`📅 Cours de la semaine (${getGroupDisplayName(group)})`)
        .setTimestamp();

    let fieldCount = 0; // Compteur pour la limite de 25 fields Discord

    for (const [day, events] of sortedDays) {
        const dayHeader = `\n📆 **__${day.charAt(0).toUpperCase() + day.slice(1)}__**\n${'━'.repeat(25)}`;

        // Sécurité : Si ajouter le header + les cours dépasse 25, on split
        // (Note: on laisse une marge de sécurité)
        if (fieldCount + 1 + events.length > 25) {
            embeds.push(currentEmbed);
            currentEmbed = new EmbedBuilder()
                .setColor(0x9B59B6)
                .setTitle(`📅 Suite de la semaine (${getGroupDisplayName(group)})`)
                .setTimestamp();
            fieldCount = 0;
        }

        currentEmbed.addFields({ name: '\u200b', value: dayHeader, inline: false });
        fieldCount++;

        for (const ev of events) {
            // Double check sécurité au cas où un jour unique est énorme
            if (fieldCount >= 25) {
                embeds.push(currentEmbed);
                currentEmbed = new EmbedBuilder().setColor(0x9B59B6).setTitle('📅 Suite...').setTimestamp();
                fieldCount = 0;
            }

            let location = (ev.location || 'Inconnue').replace(/^salle\s+/i, '');
            currentEmbed.addFields({
                name: `⏰ \`${ev.start.format('HH:mm')}\` à \`${ev.end.format('HH:mm')}\``,
                value: `**__${ev.course}__**\n👨‍🏫 **${ev.prof}**\n📍 Salle ${location}`,
                inline: false
            });
            fieldCount++;
        }
    }

    // Ne pas oublier d'ajouter le dernier embed en cours
    embeds.push(currentEmbed);

    try {
        await interaction.user.send({ embeds });
        return interaction.editReply('✅ Planning semaine envoyé en MP !');
    } catch (e) {
        return interaction.editReply('❌ Erreur MP (DMs fermés ?).');
    }
}

module.exports = { handleSemaine };
