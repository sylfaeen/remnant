import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const PROJECT_ROOT = resolve(process.cwd(), '../..');
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
