/**
 * ==============================================================================
 * 🧠 UTILS & HELPERS
 * ==============================================================================
 * Fonctions utilitaires pures (aucune dépendance Discord ni appel réseau).
 * Ces fonctions sont testables unitairement avec Jest.
 */
const { CONFIG } = require('../config');

/**
 * Supprime les espaces multiples et les espaces en début/fin de chaîne.
 * @param {string} [str='']
 * @returns {string}
 */
function squashSpaces(str = '') {
    return String(str).replace(/\s+/g, ' ').trim();
}

/**
 * Extrait le nom du cours et le nom du professeur depuis le champ SUMMARY d'un
 * événement iCal. Le prof est cherché d'abord dans le summary (ex: "M. Dupont"),
 * puis en fallback dans le champ DESCRIPTION ligne par ligne.
 * @param {string} summary  - Le champ SUMMARY de l'événement
 * @param {string} [description=''] - Le champ DESCRIPTION (fallback pour le prof)
 * @returns {{ course: string, prof: string }}
 */
function parseSummary(summary, description = '') {
    const s = squashSpaces(summary);
    const firstComma = s.indexOf(',');
    const course = (firstComma === -1 ? s : s.slice(0, firstComma)).trim() || '(Sans titre)';

    let prof = null;
    const profMatch = s.match(/(?:^|,\s*)(M\.|Mme|Mr|Mrs|Ms)\s*[^,]+/i);

    if (profMatch) {
        const start = profMatch.index ?? 0;
        let seg = s.slice(start).replace(/^,\s*/, '');
        const nextComma = seg.indexOf(',');
        if (nextComma !== -1) seg = seg.slice(0, nextComma);
        prof = squashSpaces(seg);
    }

    if (!prof && description) {
        const line = description
            .split('\n')
            .map(squashSpaces)
            .find(l => /^(M\.|Mme|Mr|Mrs|Ms)\b/i.test(l));
        if (line) prof = line;
    }

    return { course, prof: prof || '—' };
}

/**
 * Génère la chaîne de mentions Discord (@role) pour les rôles d'un groupe.
 * @param {string} group - 'groupe1' | 'groupe2' | 'pm'
 * @returns {string}
 */
function getMentions(group) {
    const roleIds = CONFIG.ROLES[group] || [];
    return roleIds.map(id => `<@&${id}>`).join(' ');
}

/**
 * Retourne le nom d'affichage lisible d'un groupe.
 * @param {string} group
 * @returns {string}
 */
function getGroupDisplayName(group) {
    const names = {
        groupe1: 'Dev Web / PGE',
        groupe2: 'Data&AI / Marketing',
        pm: 'PM'
    };
    return names[group] || group;
}

/**
 * Détermine le groupe d'appartenance d'un membre Discord à partir de ses rôles.
 * @param {import('discord.js').Collection} roles - roles.cache d'un GuildMember
 * @returns {'groupe1'|'groupe2'|'pm'|null}
 */
function extractGroup(roles) {
    const roleNames = roles.map(r => r.name);
    if (roleNames.includes('Developper Web') || roleNames.includes('PGE')) return 'groupe1';
    if (roleNames.includes('Data&AI') || roleNames.includes('Marketing')) return 'groupe2';
    if (roleNames.includes('PM')) return 'pm';
    return null;
}

module.exports = { squashSpaces, parseSummary, getMentions, getGroupDisplayName, extractGroup };
