/**
 * ==============================================================================
 * 🔔 CONTROLLER : RAPPELS
 * ==============================================================================
 * Envoie un message embed dans le salon principal 20 minutes avant chaque cours.
 * Utilise sentKeys pour éviter les doublons si la boucle tourne plusieurs fois
 * dans la même minute.
 *
 * ⚠️ CORRECTIF CRITIQUE : sentKeys est nettoyé chaque nuit à 03h00 via un cron
 * défini dans src/events/ready.js. Ne pas supprimer ce cron.
 */
const { EmbedBuilder } = require('discord.js');
const { CONFIG, dayjs } = require('../config');
const { eventsCache, sentKeys } = require('../services/calendarService');
const { parseSummary, getMentions, getGroupDisplayName } = require('../utils/helpers');
const client = require('../client');

/**
 * Vérifie pour chaque groupe si un cours commence dans exactement 20 minutes.
 * Si oui, envoie un embed de rappel dans le salon configuré.
 * Appelée toutes les 30 secondes par setInterval dans ready.js.
 */
async function loopReminders() {
    const now = dayjs().tz(CONFIG.TIMEZONE);
    const channel = await client.channels.fetch(CONFIG.CHANNEL_ID).catch(() => null);

    if (!channel) {
        console.error('❌ [Rappel] Salon introuvable.');
        return;
    }

    for (const [group, events] of Object.entries(eventsCache)) {
        const soon = events.filter(ev =>
            ev.start.isAfter(now) && ev.start.isBefore(now.add(1, 'day'))
        );

        for (const ev of soon) {
            const remindAt = ev.start.subtract(20, 'minute');

            if (now.isSame(remindAt, 'minute')) {
                const key = `${ev.uid}_${ev.start.format('YYYY-MM-DD HH:mm')}`;

                if (sentKeys.has(key)) continue;
                sentKeys.add(key);

                const { course, prof } = parseSummary(ev.summary, ev.description);

                const embed = new EmbedBuilder()
                    .setColor(0x2ECC71)
                    .setTitle('🔔 RAPPEL : Cours dans 20 minutes !')
                    .addFields(
                        { name: '📅 Jour', value: ev.start.format('dddd DD/MM'), inline: true },
                        { name: '⏰ Heure', value: ev.start.format('HH:mm'), inline: true },
                        { name: '🏫 Salle', value: ev.location || '—', inline: true },
                        { name: '📚 Cours', value: course, inline: false },
                        { name: '👨‍🏫 Prof', value: prof, inline: false },
                    )
                    .setTimestamp();

                const mentions = getMentions(group);
                const groupLabel = getGroupDisplayName(group);
                const mobileText = `${mentions}\n📣 ${groupLabel} — 🔔 Dans 20 min — ${ev.start.format('HH:mm')} — salle ${ev.location || '—'} — ${course}`;

                await channel.send({ content: mobileText, embeds: [embed], allowedMentions: { parse: ['roles'] } })
                    .catch(e => console.error('❌ [Rappel] Envoi échec :', e.message));

                console.log(`📣 Rappel envoyé pour ${course} (${group})`);
            }
        }
    }
}

module.exports = { loopReminders };
