import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { servers } from './servers';

export const firewallRules = sqliteTable('firewall_rules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  server_id: integer('server_id')
    .notNull()
    .references(() => servers.id, { onDelete: 'cascade' }),
  port: integer('port').notNull(),
  protocol: text('protocol').$type<'tcp' | 'udp' | 'both'>().notNull(),
  label: text('label').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type FirewallRule = typeof firewallRules.$inferSelect;
export type NewFirewallRule = typeof firewallRules.$inferInsert;
