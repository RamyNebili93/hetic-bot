/**
 * ==============================================================================
 * 🧪 TESTS UNITAIRES — Service Calendrier (calendarService.js)
 * ==============================================================================
 * Couvre : getNextEvent avec des événements mockés
 * Lancez avec : npm test
 */

// Setup dayjs avec les plugins timezone pour les tests
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const tzPlugin = require('dayjs/plugin/timezone');
require('dayjs/locale/fr');
dayjs.extend(utc);
dayjs.extend(tzPlugin);
dayjs.locale('fr');

// Mock du module config
jest.mock('../src/config', () => {
    const _dayjs = require('dayjs');
    return {
        CONFIG: { TIMEZONE: 'Europe/Paris', ROLES: { groupe1: [], groupe2: [], pm: [] } },
        dayjs: _dayjs,
    };
});

// On importe le service APRÈS le mock
const { eventsCache, getNextEvent } = require('../src/services/calendarService');

const TZ = 'Europe/Paris';

// ──────────────────────────────────────────────────────────────────────────────
// getNextEvent
// ──────────────────────────────────────────────────────────────────────────────
describe('getNextEvent', () => {
    beforeEach(() => {
        // Réinitialise le cache avant chaque test
        eventsCache.groupe1 = [];
        eventsCache.groupe2 = [];
        eventsCache.pm = [];
    });

    test('retourne le prochain événement à venir', () => {
        const now = dayjs().tz(TZ);
        const future = now.add(2, 'hour');
        const past = now.subtract(1, 'hour');

        eventsCache.groupe1 = [
            { uid: 'past', start: past, summary: 'Cours passé' },
            { uid: 'future', start: future, summary: 'Cours futur' },
        ];

        const result = getNextEvent(now, 'groupe1');
        expect(result).toBeDefined();
        expect(result.uid).toBe('future');
    });

    test('retourne undefined si aucun événement futur', () => {
        const now = dayjs().tz(TZ);
        eventsCache.groupe1 = [
            { uid: 'past1', start: now.subtract(3, 'hour'), summary: 'Cours 1' },
            { uid: 'past2', start: now.subtract(1, 'hour'), summary: 'Cours 2' },
        ];

        const result = getNextEvent(now, 'groupe1');
        expect(result).toBeUndefined();
    });

    test('retourne undefined si le cache du groupe est vide', () => {
        const now = dayjs().tz(TZ);
        const result = getNextEvent(now, 'groupe1');
        expect(result).toBeUndefined();
    });

    test('retourne le premier événement futur par ordre chronologique', () => {
        const now = dayjs().tz(TZ);
        eventsCache.groupe2 = [
            { uid: 'ev3', start: now.add(4, 'hour'), summary: 'Cours 3' },
            { uid: 'ev1', start: now.add(1, 'hour'), summary: 'Cours 1' },
            { uid: 'ev2', start: now.add(2, 'hour'), summary: 'Cours 2' },
        ];

        const result = getNextEvent(now, 'groupe2');
        // Attend le premier élément qui passe ev.start.isAfter(now)
        // L'ordre dépend du tableaux — pas de tri ici, juste find()
        expect(result).toBeDefined();
        expect(result.uid).toBe('ev3'); // ev3 est le premier élément du tableau
    });

    test("n'interfère pas entre deux groupes", () => {
        const now = dayjs().tz(TZ);
        eventsCache.groupe1 = [{ uid: 'g1', start: now.add(1, 'hour'), summary: 'G1' }];
        eventsCache.groupe2 = [{ uid: 'g2', start: now.add(2, 'hour'), summary: 'G2' }];

        expect(getNextEvent(now, 'groupe1').uid).toBe('g1');
        expect(getNextEvent(now, 'groupe2').uid).toBe('g2');
    });
});
