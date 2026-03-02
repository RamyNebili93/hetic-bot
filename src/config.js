/**
 * ==============================================================================
 * ⚙️ CONFIGURATION & CONSTANTES
 * ==============================================================================
 * Point unique de vérité pour toutes les constantes de l'application.
 * Selon NODE_ENV ('production' ou 'development'), le bot utilise automatiquement
 * les IDs de serveur et de salon de production ou de test.
 */
require('dotenv').config();

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const tz = require('dayjs/plugin/timezone');
require('dayjs/locale/fr');

// Configuration DayJS
dayjs.extend(utc);
dayjs.extend(tz);
dayjs.locale('fr');

// Mode actif : 'production' ou 'development' (par défaut)
const isProd = process.env.NODE_ENV === 'production';

const CONFIG = {
    TOKEN: process.env.DISCORD_TOKEN,
    CHANNEL_ID: isProd ? process.env.CHANNEL_ID : process.env.TEST_CHANNEL_ID,
    GUILD_ID: isProd ? process.env.GUILD_ID : process.env.TEST_GUILD_ID,
    ENV: process.env.NODE_ENV || 'development',
    TIMEZONE: process.env.TIMEZONE || 'Europe/Paris',
    ICS: {
        groupe1: process.env.ICS_URL_GROUPE1,
        groupe2: process.env.ICS_URL_GROUPE2,
        pm: process.env.ICS_URL_PM,
    },
    ROLES: {
        groupe1: isProd
            ? [process.env.ROLE_ID_DEV_WEB, process.env.ROLE_ID_PGE].filter(Boolean)
            : [process.env.TEST_ROLE_ID_DEV_WEB].filter(Boolean),
        groupe2: isProd
            ? [process.env.ROLE_ID_DATA_AI, process.env.ROLE_ID_MARKETING].filter(Boolean)
            : [process.env.TEST_ROLE_ID_DATA_AI].filter(Boolean),
        pm: isProd
            ? [process.env.ROLE_ID_PM].filter(Boolean)
            : [process.env.TEST_ROLE_ID_PM].filter(Boolean),
    }
};

module.exports = { CONFIG, dayjs };
