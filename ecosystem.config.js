// PM2 Ecosystem Configuration
// Usage: pm2 start ecosystem.config.js
module.exports = {
  apps: [{
    name: 'elektron-tasbih',
    script: 'server.js',
    instances: 'max',        // Use all CPU cores
    exec_mode: 'cluster',    // Cluster mode for multi-process
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000,
    },
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 8000,
    // Restart policy
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
  }],
};
