import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  clean: true,
  sourcemap: true,
  noExternal: ['@remnant/shared'],
  external: ['better-sqlite3', 'bcrypt'],
});
