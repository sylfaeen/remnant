import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import { router } from '@remnant/backend/trpc';
import { protectedProcedure } from '@remnant/backend/trpc/middlewares/auth';

const GITHUB_REPO = 'sylfaeen/remnant';
const VERSION_CACHE_TTL = 60 * 60 * 1000; // 1 hour

let cachedLatestVersion: string | null = null;
let lastVersionCheck = 0;

function getCurrentVersion(): string {
  try {
    const pkgPath = path.resolve(process.cwd(), '..', '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as { version?: string };
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

async function fetchLatestVersion(): Promise<string | null> {
  const now = Date.now();
  if (cachedLatestVersion && now - lastVersionCheck < VERSION_CACHE_TTL) {
    return cachedLatestVersion;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });

    if (!response.ok) return cachedLatestVersion;

    const data = (await response.json()) as { tag_name: string };
    cachedLatestVersion = data.tag_name.replace(/^v/, '');
    lastVersionCheck = now;
    return cachedLatestVersion;
  } catch {
    return cachedLatestVersion;
  }
}

function getIpAddress(): string | null {
  const interfaces = os.networkInterfaces();
  for (const entries of Object.values(interfaces)) {
    if (!entries) continue;
    for (const entry of entries) {
      if (!entry.internal && entry.family === 'IPv4') {
        return entry.address;
      }
    }
  }
  return null;
}

export const settingsRouter = router({
  getVersionInfo: protectedProcedure.query(async () => {
    const currentVersion = getCurrentVersion();
    const latestVersion = await fetchLatestVersion();
    const ipAddress = getIpAddress();

    return { currentVersion, latestVersion, ipAddress };
  }),

  getSystemdUnit: protectedProcedure.query(() => {
    const nodePath = process.execPath;
    const workingDirectory = process.cwd();
    const user = process.env.USER ?? os.userInfo().username;

    return {
      content: [
        '[Unit]',
        'Description=Remnant - Game Server Management Panel',
        'After=network.target',
        '',
        '[Service]',
        'Type=simple',
        `User=${user}`,
        `WorkingDirectory=${workingDirectory}`,
        `ExecStart=${nodePath} dist/index.js`,
        'Environment=NODE_ENV=production',
        `EnvironmentFile=${workingDirectory}/../../.env`,
        'Restart=always',
        'RestartSec=10',
        'StandardOutput=journal',
        'StandardError=journal',
        'SyslogIdentifier=remnant',
        '',
        '# Security hardening',
        'NoNewPrivileges=true',
        'PrivateTmp=true',
        'ProtectSystem=strict',
        'ProtectHome=true',
        `ReadWritePaths=${workingDirectory}/../..`,
        '',
        '[Install]',
        'WantedBy=multi-user.target',
      ].join('\n'),
    };
  }),
});
