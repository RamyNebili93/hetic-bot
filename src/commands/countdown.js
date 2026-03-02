/**
 * ==============================================================================
 * ⏳ COMMANDE : /countdown
 * ==============================================================================
 * Affiche un compte à rebours jusqu'à la fin des cours HETIC (22 mai 2026).
 * Inclut une barre de progression depuis la rentrée (01 sept. 2025).
 */
const { EmbedBuilder } = require('discord.js');
const { CONFIG, dayjs } = require('../config');

// ── Constantes ────────────────────────────────────────────────────────────────
const END_DATE = dayjs.tz('2026-05-22 17:00:00', CONFIG.TIMEZONE);
const START_DATE = dayjs.tz('2025-09-01 08:00:00', CONFIG.TIMEZONE); // Rentrée estimée

/**
 * Génère une barre de progression ASCII.
 * @param {number} percent - Pourcentage entre 0 et 100
 * @param {number} [length=24] - Longueur totale de la barre
 * @returns {string}
 */
function progressBar(percent, length = 24) {
    const filled = Math.round((percent / 100) * length);
    const empty = length - filled;
    return `${'█'.repeat(filled)}${'░'.repeat(empty)}`;
}

/**
 * Handler de la commande slash /countdown.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function handleCountdown(interaction) {
    await interaction.deferReply({ flags: 64 });

    const now = dayjs().tz(CONFIG.TIMEZONE);

    // Si la date est dépassée
    if (now.isAfter(END_DATE)) {
        const embed = new EmbedBuilder()
            .setColor(0x2ECC71)
            .setTitle('🎉 C\'est terminé !')
            .setDescription('Les cours HETIC sont officiellement terminés. Profite bien de ta liberté !')
            .setTimestamp();
        try {
            await interaction.user.send({ embeds: [embed] });
            return interaction.editReply('✅ Compte à rebours envoyé en MP !');
        } catch (e) {
            return interaction.editReply('❌ Erreur MP (DMs fermés ?).');
        }
    }

    // Calcul du compte à rebours
    const totalSeconds = END_DATE.diff(now, 'second');
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    // Calcul de la progression (rentrée → fin)
    const totalDuration = END_DATE.diff(START_DATE, 'second');
    const elapsed = now.diff(START_DATE, 'second');
    const percent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
    const bar = progressBar(percent);

    // Message motivationnel selon la proximité
    let motivation;
    if (days > 60) motivation = '📚 La route est encore longue, mais tu avances !';
    else if (days > 30) motivation = '💪 Plus que quelques semaines, tiens bon !';
    else if (days > 14) motivation = '🔥 La fin approche, c\'est le sprint final !';
    else if (days > 7) motivation = '⚡ Plus qu\'une semaine ! Tu y es presque !';
    else motivation = '🚀 Quelques jours seulement ! La liberté est là !';

    const embed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setTitle('⏳ Compte à rebours — Fin des cours HETIC')
        .setDescription(
            `🎯 **Objectif : 22 mai 2026 à 17h00**\n\n` +
            `\`${bar}\` **${percent}%** accompli\n\n` +
            motivation
        )
        .addFields(
            { name: '📅 Jours', value: `**${days}**`, inline: true },
            { name: '⏰ Heures', value: `**${hours}**`, inline: true },
            { name: '⏱️ Minutes', value: `**${minutes}**`, inline: true },
        )
        .setFooter({ text: `22 mai 2026 à 17h00 • HETIC` })
        .setTimestamp();

    try {
        await interaction.user.send({ embeds: [embed] });
        return interaction.editReply('✅ Compte à rebours envoyé en MP !');
    } catch (e) {
        return interaction.editReply('❌ Erreur MP (DMs fermés ?).');
    }
}


module.exports = { handleCountdown };
