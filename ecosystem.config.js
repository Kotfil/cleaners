module.exports = {
    apps: [
        {
            name: 'client-crm',
            cwd: '/home/kotfil/cleaners/client-crm', // Поправил путь
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3006,
                NODE_OPTIONS: '--max-old-space-size=128'
            },
            instances: 1,
            exec_mode: 'fork',
            max_memory_restart: '150M',
            // Убрали жесткие пути к /root/, теперь логи будут в ~/.pm2/logs/
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
        },
        {
            name: 'server-crm',
            cwd: '/home/kotfil/cleaners/server-crm',
            script: 'npm',
            args: 'run start:prod',
            env_file: '/home/kotfil/cleaners/server-crm/.env',
            env: {
                PORT: 3007,
                NODE_OPTIONS: '--max-old-space-size=180'
            },
            instances: 1,
            exec_mode: 'fork',
            max_memory_restart: '200M',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
        },
        {
            name: 'client-portal',
            cwd: '/home/kotfil/cleaners/client-portal',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3009,
                NODE_OPTIONS: '--max-old-space-size=128'
            },
            instances: 1,
            exec_mode: 'fork',
            max_memory_restart: '150M',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
        },
        {
            name: 'server-client-portal',
            cwd: '/home/kotfil/cleaners/server-client-portal',
            script: 'npm',
            args: 'run start:prod',
            env_file: '/home/kotfil/cleaners/server-client-portal/.env',
            env: {
                PORT: 3008,
                NODE_OPTIONS: '--max-old-space-size=180'
            },
            instances: 1,
            exec_mode: 'fork',
            max_memory_restart: '200M',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
        }
    ]
};