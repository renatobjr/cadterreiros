module.exports = {
  apps: [
    {
      name: "cadterreiros_api_stg",
      script: "npm",
      args: "run start:stg:pm2",
      watch: false,
    }
  ]
};
