import { join } from 'node:path';

const REMNANT_HOME = process.env.REMNANT_HOME || '/opt/remnant';

export const APP_DIR = join(REMNANT_HOME, 'app');
export const SERVERS_BASE_PATH = process.env.SERVERS_BASE_PATH || join(REMNANT_HOME, 'servers');
export const BACKUPS_BASE_PATH = process.env.BACKUPS_BASE_PATH || join(REMNANT_HOME, 'backups');
export const DATA_DIR = join(APP_DIR, 'data');
export const DATABASE_PATH = process.env.DATABASE_PATH || join(DATA_DIR, 'remnant.db');
