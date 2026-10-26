// pm2 config for the contact form API.
// Secrets are read from .env next to this file (on the VPS: /var/www/f-suite-api/.env, written by deploy from ENV_FILE).
// Start/reload: pm2 startOrReload ecosystem.config.cjs --update-env

const fs = require('node:fs');
const path = require('node:path');

const readEnvFile = (file) => {
  if (!fs.existsSync(file)) return {};
  const env = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (match && !line.trim().startsWith('#')) env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return env;
};

module.exports = {
  apps: [
    {
      name: 'f-suite-api',
      script: path.join(__dirname, 'index.mjs'),
      env: {
        HOST: '127.0.0.1',
        PORT: '1804',
        ...readEnvFile(path.join(__dirname, '.env')),
      },
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
