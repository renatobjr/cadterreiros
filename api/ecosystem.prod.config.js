module.exports = {
  apps: [
    {
      name: "cadterreiros_api_prod",
      script: "./dist/index.js",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "500M",
      max_restarts: 10,
      min_uptime: "10s",
      kill_timeout: 5000,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/api-error.log",
      out_file: "./logs/api-out.log",
      merge_logs: true,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
