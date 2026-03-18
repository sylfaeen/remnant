import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../../../..');
export const ENV_PATH = resolve(PROJECT_ROOT, '.env');

export function readEnvContent(): string {
  if (!existsSync(ENV_PATH)) {
    return '';
  }
  return readFileSync(ENV_PATH, 'utf-8');
}

export function writeEnvContent(content: string): void {
  writeFileSync(ENV_PATH, content, 'utf-8');
}
