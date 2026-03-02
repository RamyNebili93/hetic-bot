/**
 * ==============================================================================
 * 📋 CONTROLLER : DIGEST QUOTIDIEN
 * ==============================================================================
 * Envoie le résumé des cours du lendemain.
 * Déclenché automatiquement à 18h00 par cron, ou manuellement via /demain
 * et !test_digest.
 */
const { EmbedBuilder } = require('discord.js');
const { CONFIG, dayjs } = require('../config');
const { eventsCache } = require('../services/calendarService');
const { parseSummary, getMentions, getGroupDisplayName } = require('../utils/helpers');
const client = require('../client');

/**
 * Envoie le digest des cours du lendemain.
 * @param {import('discord.js').User|null} targetUser
 *   Si fourni, envoie en DM à cet utilisateur (mode preview ADMIN).
 *   Si null, envoie dans le salon public (mode automatique).
 * @param {import('dayjs').Dayjs|null} dateOverride
 *   Permet de forcer une date cible (utilisé le week-end pour afficher Lundi).
 * @returns {Promise<boolean>} true si au moins un message a été envoyé.
 */
async function sendDailyDigest(targetUser = null, dateOverride = null) {
    let target = targetUser;
    if (!target) {
        target = await client.channels.fetch(CONFIG.CHANNEL_ID).catch(() => null);
    }

    if (!target) {
        console.error('❌ [Digest] Destination introuvable.');
        return false;
    }

    const baseDate = dateOverride ? dateOverride : dayjs().tz(CONFIG.TIMEZONE);
    const startOfTargetDay = baseDate.add(1, 'day').startOf('day');
    const endOfTargetDay = baseDate.add(1, 'day').endOf('day');

    const groups = ['groupe1', 'groupe2', 'pm'];
    let messageSent = false;

    console.log(`🔎 [Digest] Cible: ${startOfTargetDay.format('DD/MM/YYYY')} (Mode: ${targetUser ? 'PRIVÉ' : 'PUBLIC'})`);

    for (const group of groups) {
        const events = eventsCache[group]?.filter(ev =>
            ev.start.isAfter(startOfTargetDay) && ev.start.isBefore(endOfTargetDay)
        ) || [];

        if (events.length === 0) continue;

        const embed = new EmbedBuilder()
            .setColor(0xE67E22)
            .setTitle(`📅 Cours du ${startOfTargetDay.format('dddd DD/MM')} (${getGroupDisplayName(group)})`)
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

        const mentions = getMentions(group);
        const groupLabel = getGroupDisplayName(group);
        const content = targetUser
            ? `🕵️ **[PREVIEW ADMIN]** Digest pour le **${group}** :`
            : `👋 Bonsoir ${mentions} (${groupLabel}), n'oubliez pas vos cours de demain !`;

        await target.send({ content, embeds: [embed], allowedMentions: { parse: ['roles'] } })
            .catch(e => console.error(`❌ [Digest] Erreur envoi ${group} :`, e.message));

        messageSent = true;
    }

    return messageSent;
}

module.exports = { sendDailyDigest };
