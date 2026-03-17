export type Permission = '*' | 'server:control' | 'server:console' | 'files:read' | 'files:write' | 'users:manage';

export interface User {
  id: number;
  username: string;
  permissions: Array<Permission>;
  locale: string | null;
  token_version: number;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: number;
  user_id: number;
  refresh_token: string;
  expires_at: string;
  created_at: string;
}

export interface ServerMetrics {
  cpu: number;
  cpu_raw: number;
  cpu_cores: number;
  memory: number;
  memory_total: number;
  memory_percent: number;
  uptime: number;
  timestamp: string;
}

export interface PlayersUpdate {
  server_id: number;
  players: Array<string>;
  count: number;
  timestamp: string;
}
