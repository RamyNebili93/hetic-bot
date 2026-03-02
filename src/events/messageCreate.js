/**
 * ==============================================================================
 * ⚡ ÉVÉNEMENT : messageCreate — Commandes Texte (Legacy)
 * ==============================================================================
 * Gère les commandes texte réservées aux administrateurs :
 *   - !test_digest  : génère et envoie le digest en DM
 *   - !test_rappel  : envoie un embed de rappel de test en DM
 */
const { EmbedBuilder } = require('discord.js');
const { CONFIG, dayjs } = require('../config');
const { sendDailyDigest } = require('../controllers/digest');
const { extractGroup } = require('../utils/helpers');

/**
 * Attache l'événement 'messageCreate' au client Discord.
 * @param {import('discord.js').Client} client
 */
function registerMessageCreateEvent(client) {
    client.on('messageCreate', async (msg) => {
        if (msg.author.bot) return;
        const content = msg.content.trim();

        // 1. !test_digest
        if (content === '!test_digest') {
            if (!msg.member.permissions.has('Administrator')) return msg.reply('❌ Admin only.');
            console.log('📋 Commande !test_digest par', msg.author.tag);
            await msg.reply('⏳ Génération du digest (MP)...');

            const now = dayjs().tz(CONFIG.TIMEZONE);
            let dateOverride = null;
            if (now.day() === 5 || now.day() === 6) {
                dateOverride = now.day(7);
                await msg.author.send("ℹ️ **Note debug :** C'est le week-end, j'affiche le planning de Lundi.");
            }
            const sent = await sendDailyDigest(msg.author, dateOverride);
            if (!sent) await msg.author.send("📭 Aucun cours trouvé.");
            else await msg.reply("✅ Check tes DMs !");
            return;
        }

        // 2. !test_rappel
        if (content === '!test_rappel') {
            if (!msg.member.permissions.has('Administrator')) return msg.reply('❌ Admin only.');
            console.log('📋 Commande !test_rappel par', msg.author.tag);
            await msg.reply('⏳ Envoi d\'un rappel de test...');

            const group = extractGroup(msg.member?.roles?.cache);
            if (!group) return msg.reply("❌ Aucun rôle de groupe détecté sur toi.");

            const now = dayjs().tz(CONFIG.TIMEZONE);
            const fakeStart = now.add(20, 'minute');
            const course = 'Test de rappel';
            const location = 'B101';

            const embed = new EmbedBuilder()
                .setColor(0x2ECC71)
                .setTitle('🔔 RAPPEL (TEST) : Cours dans 20 minutes !')
                .addFields(
                    { name: '📅 Jour', value: fakeStart.format('dddd DD/MM'), inline: true },
                    { name: '⏰ Heure', value: fakeStart.format('HH:mm'), inline: true },
                    { name: '🏫 Salle', value: location, inline: true },
                    { name: '📚 Cours', value: course, inline: false },
                    { name: '👨‍🏫 Prof', value: 'Prof. Test', inline: false },
                )
                .setTimestamp();

            const mobileText = `🔔 Dans 20 min — ${fakeStart.format('HH:mm')} — salle ${location} — ${course}`;

            await msg.author.send({ content: mobileText, embeds: [embed] })
                .then(() => msg.reply('✅ Check tes DMs !'))
                .catch(() => msg.reply('❌ Impossible d\'envoyer le DM (ouverts ?).'));
            return;
        }
    });
}

module.exports = { registerMessageCreateEvent };
