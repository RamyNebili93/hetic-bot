/**
 * ==============================================================================
 * 🧪 TESTS UNITAIRES — Fonctions utilitaires (helpers.js)
 * ==============================================================================
 * Couvre : squashSpaces, parseSummary, getGroupDisplayName, extractGroup
 * Lancez avec : npm test
 */

// Mock du module config pour isoler les tests des variables d'environnement
jest.mock('../src/config', () => ({
    CONFIG: {
        ROLES: {
            groupe1: ['111111111111111111', '222222222222222222'],
            groupe2: ['333333333333333333', '444444444444444444'],
            pm: ['555555555555555555'],
        },
        TIMEZONE: 'Europe/Paris',
        ENV: 'test',
    },
    dayjs: require('dayjs'),
}));

const {
    squashSpaces,
    parseSummary,
    getMentions,
    getGroupDisplayName,
    extractGroup,
} = require('../src/utils/helpers');

// ──────────────────────────────────────────────────────────────────────────────
// squashSpaces
// ──────────────────────────────────────────────────────────────────────────────
describe('squashSpaces', () => {
    test('supprime les espaces multiples internes', () => {
        expect(squashSpaces('foo   bar')).toBe('foo bar');
    });

    test('supprime les espaces en début et fin', () => {
        expect(squashSpaces('  hello world  ')).toBe('hello world');
    });

    test('gère une chaîne déjà propre', () => {
        expect(squashSpaces('clean')).toBe('clean');
    });

    test('gère une chaîne vide', () => {
        expect(squashSpaces('')).toBe('');
    });

    test('gère undefined (valeur par défaut)', () => {
        expect(squashSpaces()).toBe('');
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// parseSummary
// ──────────────────────────────────────────────────────────────────────────────
describe('parseSummary', () => {
    test('extrait le cours seul (sans prof dans le summary)', () => {
        const result = parseSummary('Développement Web');
        expect(result.course).toBe('Développement Web');
        expect(result.prof).toBe('—');
    });

    test('extrait le cours ET le prof (M.) depuis le summary', () => {
        const result = parseSummary('Développement Web, M. Dupont');
        expect(result.course).toBe('Développement Web');
        expect(result.prof).toBe('M. Dupont');
    });

    test('extrait le prof avec préfixe Mme', () => {
        const result = parseSummary('UI Design, Mme Martin');
        expect(result.course).toBe('UI Design');
        expect(result.prof).toBe('Mme Martin');
    });

    test('extrait le prof depuis la description si absent du summary', () => {
        const result = parseSummary('Design UX', 'Mme Leroy\nSalle B201');
        expect(result.course).toBe('Design UX');
        expect(result.prof).toBe('Mme Leroy');
    });

    test('retourne "(Sans titre)" pour un summary vide', () => {
        const result = parseSummary('');
        expect(result.course).toBe('(Sans titre)');
        expect(result.prof).toBe('—');
    });

    test('gère les espaces multiples dans le summary', () => {
        const result = parseSummary('  Design   Graphique  ,  M.  Blanc  ');
        expect(result.course).toBe('Design Graphique');
        expect(result.prof).toBe('M. Blanc');
    });

    test("retourne '—' si aucun prof trouvé nulle part", () => {
        const result = parseSummary('Cours sans prof', 'Aucune info de professeur ici');
        expect(result.prof).toBe('—');
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// getGroupDisplayName
// ──────────────────────────────────────────────────────────────────────────────
describe('getGroupDisplayName', () => {
    test('retourne le bon nom pour groupe1', () => {
        expect(getGroupDisplayName('groupe1')).toBe('Dev Web / PGE');
    });

    test('retourne le bon nom pour groupe2', () => {
        expect(getGroupDisplayName('groupe2')).toBe('Data&AI / Marketing');
    });

    test('retourne le bon nom pour pm', () => {
        expect(getGroupDisplayName('pm')).toBe('PM');
    });

    test('retourne le nom brut pour un groupe inconnu', () => {
        expect(getGroupDisplayName('xfoo')).toBe('xfoo');
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// extractGroup
// ──────────────────────────────────────────────────────────────────────────────
describe('extractGroup', () => {
    // Helper : simule la Collection Discord (qui a une méthode .map)
    const fakeCollection = (names) => ({ map: (fn) => names.map(name => fn({ name })) });

    test('détecte groupe1 via rôle "Developper Web"', () => {
        expect(extractGroup(fakeCollection(['Developper Web']))).toBe('groupe1');
    });

    test('détecte groupe1 via rôle "PGE"', () => {
        expect(extractGroup(fakeCollection(['PGE']))).toBe('groupe1');
    });

    test('détecte groupe2 via rôle "Data&AI"', () => {
        expect(extractGroup(fakeCollection(['Data&AI']))).toBe('groupe2');
    });

    test('détecte groupe2 via rôle "Marketing"', () => {
        expect(extractGroup(fakeCollection(['Marketing']))).toBe('groupe2');
    });

    test('détecte pm via rôle "PM"', () => {
        expect(extractGroup(fakeCollection(['PM']))).toBe('pm');
    });

    test('retourne null si aucun rôle connu', () => {
        expect(extractGroup(fakeCollection(['Admin', 'Moderator', '@everyone']))).toBeNull();
    });

    test('prend le premier groupe trouvé si plusieurs rôles', () => {
        // PGE + Marketing → groupe1 (PGE est trouvé en premier)
        expect(extractGroup(fakeCollection(['PGE', 'Marketing']))).toBe('groupe1');
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// getMentions
// ──────────────────────────────────────────────────────────────────────────────
describe('getMentions', () => {
    test('génère les mentions correctes pour groupe1', () => {
        const result = getMentions('groupe1');
        expect(result).toBe('<@&111111111111111111> <@&222222222222222222>');
    });

    test('génère la mention correcte pour pm (un seul rôle)', () => {
        const result = getMentions('pm');
        expect(result).toBe('<@&555555555555555555>');
    });

    test("retourne une chaîne vide pour un groupe sans rôles", () => {
        const result = getMentions('inconnu');
        expect(result).toBe('');
    });
});
