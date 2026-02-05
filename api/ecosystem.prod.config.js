module.exports = {
  apps: [
    {
      name: "cadterreiros_api_prod",
      script: "npm",
      args: "run start:prod:pm2",
      watch: true,
    }
  ]
};
