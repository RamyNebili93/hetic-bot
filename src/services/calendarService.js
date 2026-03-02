/**
 * ==============================================================================
 * 📅 SERVICE CALENDRIER
 * ==============================================================================
 * Gère le chargement, le cache des événements iCal, et la déduplication
 * des rappels via sentKeys.
 *
 * ⚠️ ÉTAT PARTAGÉ : eventsCache et sentKeys sont exportés par référence.
 * Tous les modules qui les importent voient le même objet en mémoire.
 * La mutation (eventsCache[group] = [...]) est visible partout.
 */
const ical = require('node-ical');
const { CONFIG, dayjs } = require('../config');

// ── État global partagé ──────────────────────────────────────────────────────
let eventsCache = { groupe1: [], groupe2: [], pm: [] };
const sentKeys = new Set();

/**
 * Charge et met en cache les événements depuis une URL iCal.
 * Trie les événements par date de début croissante.
 * @param {string} url       - URL du calendrier iCal
 * @param {string} groupName - 'groupe1' | 'groupe2' | 'pm'
 */
async function loadCalendar(url, groupName) {
    if (!url) {
        console.warn(`⚠️ URL manquante pour ${groupName}`);
        return;
    }
    try {
        const data = await ical.async.fromURL(url);
        const items = [];

        for (const v of Object.values(data)) {
            if (v.type !== 'VEVENT' || !v.start || !v.end) continue;
            items.push({
                uid: v.uid || `${v.summary}-${v.start?.toISOString?.()}`,
                start: dayjs(v.start).tz(CONFIG.TIMEZONE),
                end: dayjs(v.end).tz(CONFIG.TIMEZONE),
                summary: v.summary || '(Sans titre)',
                location: v.location || '—',
                description: v.description ? String(v.description) : ''
            });
        }

        items.sort((a, b) => a.start.valueOf() - b.start.valueOf());
        eventsCache[groupName] = items;
        console.log(`✅ [Calendar] Chargé pour ${groupName} : ${items.length} évènements.`);
    } catch (err) {
        console.error(`❌ [Calendar] Erreur chargement ${groupName} :`, err.message);
    }
}

/**
 * Retourne le prochain événement à venir pour un groupe donné.
 * @param {import('dayjs').Dayjs} now
 * @param {string} group
 * @returns {object|undefined}
 */
function getNextEvent(now = dayjs().tz(CONFIG.TIMEZONE), group) {
    return eventsCache[group]?.find(ev => ev.start.isAfter(now));
}

module.exports = { eventsCache, sentKeys, loadCalendar, getNextEvent };
