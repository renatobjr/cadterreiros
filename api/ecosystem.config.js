module.exports = {
  apps: [
    {
      name: "cadterreiros_api",
      script: "npm",
      args: "run start",
      watch: true,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
