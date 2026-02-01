import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
} = process.env;

const privateKeyPath = path.join(__dirname, '../../certs/private.pem');
// We use synchronous read here because this is startup configuration.
// If the key is missing, we want the app to crash immediately rather than at runtime.
const PRIVATE_KEY = fs.readFileSync(privateKeyPath, 'utf-8');

export const Config = {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    PRIVATE_KEY,
    REFRESH_TOKEN_SECRET,
};
