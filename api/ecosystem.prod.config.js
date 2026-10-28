module.exports = {
  apps: [
    {
      name: "cadterreiros_api_prod",
      script: "npm",
      args: "run start:prod:pm2",
      // Produção: sem watch (reinício a cada arquivo) e com NODE_ENV explícito
      // para cookie Secure, CORS restrito e trust proxy.
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
