module.exports = {
  apps: [
    {
      name: 'client-crm',
      cwd: '/cleaners/client-crm',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3006,
        NODE_OPTIONS: '--max-old-space-size=128'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '150M',
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
        PORT: 3009,
        NODE_OPTIONS: '--max-old-space-size=128'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '150M',
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
      env: {
        NODE_OPTIONS: '--max-old-space-size=180'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '200M',
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
      env: {
        NODE_OPTIONS: '--max-old-space-size=180'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '200M',
      error_file: '/root/.pm2/logs/server-client-portal-error.log',
      out_file: '/root/.pm2/logs/server-client-portal-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'portfolio-server',
      cwd: '/Portfolio/server',
      script: 'npm',
      args: 'run start:prod',
      env_file: '/Portfolio/server/.env',
      env: {
        NODE_OPTIONS: '--max-old-space-size=180'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '200M',
      error_file: '/root/.pm2/logs/portfolio-server-error.log',
      out_file: '/root/.pm2/logs/portfolio-server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'main-crm-client',
      cwd: '/main-crm/client',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3004,
        NODE_OPTIONS: '--max-old-space-size=128'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '150M',
      error_file: '/root/.pm2/logs/main-crm-client-error.log',
      out_file: '/root/.pm2/logs/main-crm-client-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'main-crm-server',
      cwd: '/main-crm/server',
      script: 'npm',
      args: 'run start:prod',
      env_file: '/main-crm/server/.env',
      env: {
        NODE_OPTIONS: '--max-old-space-size=180'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '200M',
      error_file: '/root/.pm2/logs/main-crm-server-error.log',
      out_file: '/root/.pm2/logs/main-crm-server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
