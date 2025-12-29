module.exports = {
  apps: [
    {
      name: 'client-crm',
      cwd: '/cleaners/client-crm',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3006
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/root/.pm2/logs/client-crm-error.log',
      out_file: '/root/.pm2/logs/client-crm-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'client-portal',
      cwd: '/cleaners/client-portal',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3009
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/root/.pm2/logs/client-portal-error.log',
      out_file: '/root/.pm2/logs/client-portal-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'server-crm',
      cwd: '/cleaners/server-crm',
      script: 'npm',
      args: 'run start:prod',
      env_file: '/cleaners/server-crm/.env',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/root/.pm2/logs/server-crm-error.log',
      out_file: '/root/.pm2/logs/server-crm-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'server-client-portal',
      cwd: '/cleaners/server-client-portal',
      script: 'npm',
      args: 'run start:prod',
      env_file: '/cleaners/server-client-portal/.env',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/root/.pm2/logs/server-client-portal-error.log',
      out_file: '/root/.pm2/logs/server-client-portal-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};

