module.exports = {
  apps: [
    {
      name: 'ace-service',
      script: 'dist/index.js',
      cwd: '/var/www/ACE',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8001,
        HOST: '0.0.0.0'
      },
      error_file: '/var/log/pm2/ace-error.log',
      out_file: '/var/log/pm2/ace-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
