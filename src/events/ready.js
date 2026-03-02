/**
 * ==============================================================================
 * ⚡ ÉVÉNEMENT : ready
 * ==============================================================================
 * Déclenché une seule fois quand le bot est connecté et prêt.
 * Gère dans l'ordre :
 *   1. Chargement initial des calendriers iCal
 *   2. Enregistrement des commandes slash
 *   3. Démarrage des boucles et crons
 *
 * ⚠️ CORRECTIFS CRITIQUES :
 *   - Cron 03h00 : nettoyage de sentKeys (évite les rappels en double)
 *   - setInterval 30s : boucle de rappels actifs
 */
const cron = require('node-cron');
const { CONFIG, dayjs } = require('../config');
const { loadCalendar, eventsCache, sentKeys } = require('../services/calendarService');
const { loopReminders } = require('../controllers/reminders');
const { sendDailyDigest } = require('../controllers/digest');
const { registerCommands } = require('../commands/index');

/**
 * Attache l'événement 'ready' au client Discord.
 * @param {import('discord.js').Client} client
 */
function registerReadyEvent(client) {
    client.once('ready', async () => {
        console.log(`🤖 Connecté en tant que ${client.user.tag}`);
        console.log(`🌍 Mode : ${CONFIG.ENV.toUpperCase()} | Guild : ${CONFIG.GUILD_ID} | Salon : ${CONFIG.CHANNEL_ID}`);
        client.user.setActivity('tes cours HETIC', { type: 3 });

        // 1. Chargement initial des calendriers
        await loadCalendar(CONFIG.ICS.groupe1, 'groupe1');
        await loadCalendar(CONFIG.ICS.groupe2, 'groupe2');
        await loadCalendar(CONFIG.ICS.pm, 'pm');

        // DEBUG: Vérification des rôles et événements chargés
        console.log('🔍 [Debug] ROLES configurés :', JSON.stringify(CONFIG.ROLES));
        for (const [group, events] of Object.entries(eventsCache)) {
            console.log(`🔍 [Debug] ${group}: ${events.length} événements en cache`);
        }

        // 2. Enregistrement des commandes slash
        await registerCommands(client, CONFIG.GUILD_ID);

        // 3. Boucle de rappels (toutes les 30 secondes)
        setInterval(loopReminders, 30 * 1000);

        // Cron Digest quotidien (18h00)
        cron.schedule('0 18 * * *', async () => {
            console.log('🌇 [Cron] Digest quotidien…');
            await sendDailyDigest();
        }, { timezone: CONFIG.TIMEZONE });

        // Cron Nettoyage mémoire (03h00 du matin) — Évite les rappels en double
        cron.schedule('0 3 * * *', () => {
            console.log('🧹 [Cleanup] Nettoyage préventif sentKeys...');
            sentKeys.clear();
        }, { timezone: CONFIG.TIMEZONE });

        // Cron Refresh calendrier (toutes les heures)
        cron.schedule('0 * * * *', async () => {
            console.log('🔁 [Cron] Refresh périodique…');
            await loadCalendar(CONFIG.ICS.groupe1, 'groupe1');
            await loadCalendar(CONFIG.ICS.groupe2, 'groupe2');
            await loadCalendar(CONFIG.ICS.pm, 'pm');
        }, { timezone: CONFIG.TIMEZONE });
    });
}

module.exports = { registerReadyEvent };
