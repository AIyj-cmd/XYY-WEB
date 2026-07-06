module.exports = {
  apps: [
    {
      name: 'xyy-web',
      script: 'server.mjs',
      cwd: '/var/www/xyy-web',
      interpreter: '/opt/node-v22/bin/node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '4321',
      },
    },
  ],
}
