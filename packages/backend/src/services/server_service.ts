import { and, eq, ne } from 'drizzle-orm';
import { join } from 'node:path';
import { db } from '@remnant/backend/db';
import { servers } from '@remnant/backend/db/schema';
import { serverProcessManager } from '@remnant/backend/services/server_process_manager';
import { serverSetupService } from '@remnant/backend/services/server_setup_service';
import { metricsService } from '@remnant/backend/services/metrics_service';
import { playersService } from '@remnant/backend/services/players_service';
import {
  type BackupProgress,
  type BackupResult,
  type BackupSource,
  backupService,
} from '@remnant/backend/services/backup_service';
import { DEFAULT_JAVA_PORT, ErrorCodes } from '@remnant/shared';
import { SERVERS_BASE_PATH } from '@remnant/backend/services/paths';
import { firewallService } from '@remnant/backend/services/firewall_service';

export interface CreateServerRequest {
  name: string;
  min_ram?: string;
  max_ram?: string;
  jvm_flags?: string;
  java_port?: number;
  auto_start?: boolean;
}

export interface UpdateServerRequest {
  name?: string;
  path?: string;
  jar_file?: string;
  min_ram?: string;
  max_ram?: string;
  jvm_flags?: string;
  java_port?: number;
  java_path?: string | null;
  auto_start?: boolean;
}

export class ServerService {
  async getNextAvailablePort(): Promise<number> {
    const allServers = await db.select({ java_port: servers.java_port }).from(servers);
    const usedPorts = new Set(allServers.map((s) => s.java_port));

    let port = DEFAULT_JAVA_PORT;
    while (usedPorts.has(port)) {
      port++;
    }
    return port;
  }

  async isPortAvailable(port: number, excludeServerId?: number): Promise<boolean> {
    const conditions = excludeServerId
      ? and(eq(servers.java_port, port), ne(servers.id, excludeServerId))
      : eq(servers.java_port, port);

    const existing = await db.select({ id: servers.id }).from(servers).where(conditions).limit(1);
    return existing.length === 0;
  }

  async getAllServers() {
    const allServers = await db.select().from(servers);

    const results = await Promise.all(
      allServers.map(async (server) => {
        const status = serverProcessManager.getStatus(server.id);
        const metrics = status.status === 'running' ? await metricsService.getServerMetrics(server.id) : null;
        const playerCount = playersService.getPlayerCount(server.id);

        return {
          ...server,
          ...status,
          cpu: metrics?.cpu ?? null,
          player_count: playerCount,
        };
      })
    );

    return results;
  }

  async getServerById(id: number) {
    const [server] = await db.select().from(servers).where(eq(servers.id, id)).limit(1);
    if (!server) return null;

    const status = serverProcessManager.getStatus(server.id);
    const metrics = status.status === 'running' ? await metricsService.getServerMetrics(server.id) : null;

    return {
      ...server,
      ...status,
      cpu: metrics?.cpu ?? null,
      player_count: playersService.getPlayerCount(server.id),
      players: playersService.getPlayers(server.id),
    };
  }

  async createServer(data: CreateServerRequest) {
    // Generate a slug from the server name for the directory
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const serverPath = join(SERVERS_BASE_PATH, slug);

    // Auto-assign next available port if none specified, or validate the requested one
    let javaPort: number;
    if (data.java_port) {
      const available = await this.isPortAvailable(data.java_port);
      if (!available) {
        throw new Error(ErrorCodes.SERVER_PORT_ALREADY_IN_USE);
      }
      javaPort = data.java_port;
    } else {
      javaPort = await this.getNextAvailablePort();
    }

    const setupResult = await serverSetupService.initializeServer({
      serverPath,
      serverName: data.name,
      javaPort,
    });

    const [newServer] = await db
      .insert(servers)
      .values({
        name: data.name,
        path: serverPath,
        jar_file: setupResult.paperJar,
        min_ram: data.min_ram || '2G',
        max_ram: data.max_ram || '4G',
        jvm_flags: data.jvm_flags || '',
        java_port: javaPort,
        auto_start: data.auto_start ?? true,
      })
      .returning();

    // Automatically open the server port on the firewall
    await firewallService.addRule(newServer.id, javaPort, 'tcp', `${data.name} (Minecraft)`);

    return {
      ...newServer,
      ...serverProcessManager.getStatus(newServer.id),
    };
  }

  async updateServer(id: number, data: UpdateServerRequest) {
    const [existing] = await db.select().from(servers).where(eq(servers.id, id)).limit(1);
    if (!existing) {
      return { success: false as const, error: 'SERVER_NOT_FOUND' };
    }

    // Validate port uniqueness if changing port
    if (data.java_port !== undefined && data.java_port !== existing.java_port) {
      const available = await this.isPortAvailable(data.java_port, id);
      if (!available) {
        return { success: false as const, error: ErrorCodes.SERVER_PORT_ALREADY_IN_USE };
      }
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.jar_file !== undefined) updateData.jar_file = data.jar_file;
    if (data.min_ram !== undefined) updateData.min_ram = data.min_ram;
    if (data.max_ram !== undefined) updateData.max_ram = data.max_ram;
    if (data.jvm_flags !== undefined) updateData.jvm_flags = data.jvm_flags;
    if (data.java_port !== undefined) updateData.java_port = data.java_port;
    if (data.java_path !== undefined) updateData.java_path = data.java_path;
    if (data.auto_start !== undefined) updateData.auto_start = data.auto_start;

    const [updatedServer] = await db.update(servers).set(updateData).where(eq(servers.id, id)).returning();

    // Regenerate server.properties if port changed
    if (data.java_port !== undefined && data.java_port !== existing.java_port) {
      await serverSetupService.updateServerPort(updatedServer.path, data.java_port);
    }

    return {
      success: true as const,
      server: {
        ...updatedServer,
        ...serverProcessManager.getStatus(updatedServer.id),
      },
    };
  }

  async deleteServer(
    id: number,
    options?: {
      createBackup?: boolean;
      onBackupProgress?: (progress: BackupProgress) => void;
    }
  ): Promise<{
    success: boolean;
    error?: string;
    backup?: BackupResult;
  }> {
    const [existing] = await db.select().from(servers).where(eq(servers.id, id)).limit(1);
    if (!existing) {
      return { success: false, error: 'SERVER_NOT_FOUND' };
    }

    // Check if the server is running
    const status = serverProcessManager.getStatus(id);
    if (status.status !== 'stopped') {
      return { success: false, error: 'SERVER_MUST_BE_STOPPED' };
    }

    let backupResult: BackupResult | undefined;

    if (options?.createBackup) {
      backupResult = await backupService.createFullBackup(existing.path, existing.name, 'manual', options.onBackupProgress);

      if (!backupResult.success) {
        return {
          success: false,
          error: `BACKUP_FAILED: ${backupResult.error}`,
          backup: backupResult,
        };
      }
    }

    const deleteResult = await backupService.deleteServerDirectory(existing.path);
    if (!deleteResult.success) {
      return {
        success: false,
        error: `DELETE_DIRECTORY_FAILED: ${deleteResult.error}`,
        backup: backupResult,
      };
    }

    await db.delete(servers).where(eq(servers.id, id));

    return {
      success: true,
      backup: backupResult,
    };
  }

  async startServer(id: number) {
    const server = await this.getServerById(id);
    if (!server) return { success: false as const, error: 'SERVER_NOT_FOUND' };

    return await serverProcessManager.start({
      id: server.id,
      name: server.name,
      path: server.path,
      jar_file: server.jar_file,
      min_ram: server.min_ram,
      max_ram: server.max_ram,
      jvm_flags: server.jvm_flags,
      java_port: server.java_port,
      java_path: server.java_path,
    });
  }

  async stopServer(id: number) {
    const server = await this.getServerById(id);
    if (!server) return { success: false as const, error: 'SERVER_NOT_FOUND' };
    return serverProcessManager.stop(id);
  }

  async restartServer(id: number) {
    const server = await this.getServerById(id);
    if (!server) return { success: false as const, error: 'SERVER_NOT_FOUND' };
    return serverProcessManager.restart({
      id: server.id,
      name: server.name,
      path: server.path,
      jar_file: server.jar_file,
      min_ram: server.min_ram,
      max_ram: server.max_ram,
      jvm_flags: server.jvm_flags,
      java_port: server.java_port,
      java_path: server.java_path,
    });
  }

  async listBackups(id: number) {
    const [existing] = await db.select().from(servers).where(eq(servers.id, id)).limit(1);
    if (!existing) return { success: false as const, error: 'SERVER_NOT_FOUND', backups: [] };

    const backups = await backupService.listBackups(existing.name);
    return {
      success: true as const,
      backups: backups.map((b) => ({
        name: b.name,
        size: b.size,
        date: b.date.toISOString(),
      })),
    };
  }

  async deleteBackup(filename: string) {
    return backupService.deleteBackup(filename);
  }

  getBackupPath(filename: string) {
    return backupService.getBackupPath(filename);
  }

  async backupServer(
    id: number,
    paths?: Array<string>,
    source: BackupSource = 'manual'
  ): Promise<{ success: boolean; error?: string; backup?: BackupResult }> {
    const [existing] = await db.select().from(servers).where(eq(servers.id, id)).limit(1);
    if (!existing) {
      return { success: false, error: 'SERVER_NOT_FOUND' };
    }

    const result =
      paths && paths.length > 0
        ? await backupService.createSelectiveBackup(existing.path, existing.name, paths, source)
        : await backupService.createFullBackup(existing.path, existing.name, source);

    if (!result.success) {
      return { success: false, error: `BACKUP_FAILED: ${result.error}` };
    }

    return { success: true, backup: result };
  }

  sendCommand(id: number, command: string) {
    return serverProcessManager.sendCommand(id, command);
  }
}
