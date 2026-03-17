import introduction from '@remnant/frontend/pages/app/docs/markdowns/introduction.md?raw';
import installation from '@remnant/frontend/pages/app/docs/markdowns/installation.md?raw';
import configuration from '@remnant/frontend/pages/app/docs/markdowns/configuration.md?raw';
import serverManagement from '@remnant/frontend/pages/app/docs/markdowns/server-management.md?raw';
import domain from '@remnant/frontend/pages/app/docs/markdowns/domain.md?raw';
import console from '@remnant/frontend/pages/app/docs/markdowns/console.md?raw';
import files from '@remnant/frontend/pages/app/docs/markdowns/files.md?raw';
import plugins from '@remnant/frontend/pages/app/docs/markdowns/plugins.md?raw';
import tasks from '@remnant/frontend/pages/app/docs/markdowns/tasks.md?raw';
import users from '@remnant/frontend/pages/app/docs/markdowns/users.md?raw';
import security from '@remnant/frontend/pages/app/docs/markdowns/security.md?raw';
import docker from '@remnant/frontend/pages/app/docs/markdowns/docker.md?raw';
import api from '@remnant/frontend/pages/app/docs/markdowns/api.md?raw';
import rateLimits from '@remnant/frontend/pages/app/docs/markdowns/rate-limits.md?raw';

export const docsContent: Record<string, string> = {
  introduction,
  installation,
  configuration,
  'server-management': serverManagement,
  domain,
  console,
  files,
  plugins,
  tasks,
  users,
  security,
  docker,
  api,
  'rate-limits': rateLimits,
};

export const docsSlugs = Object.keys(docsContent);

export const DEFAULT_DOC_SLUG = 'introduction';
