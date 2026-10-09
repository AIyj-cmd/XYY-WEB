const { readFileSync, realpathSync } = require('node:fs')
const { join } = require('node:path')
const { parse } = require('dotenv')

const appRoot = realpathSync(__dirname)
const defaultHost = '0.0.0.0'
let runtimeHost = defaultHost

try {
  runtimeHost = parse(readFileSync(join(appRoot, '.env'), 'utf8')).HOST || defaultHost
} catch (error) {
  if (error?.code !== 'ENOENT') throw error
}

module.exports = {
  apps: [
    {
      name: 'xyy-web',
      script: 'server.mjs',
      cwd: appRoot,
      interpreter: '/opt/node-v22/bin/node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        HOST: runtimeHost,
        PORT: '50031',
      },
    },
  ],
}
