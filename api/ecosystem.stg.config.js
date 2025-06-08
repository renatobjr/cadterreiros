module.exports = {
  apps: [
    {
      name: "cadterreiros_api_stg",
      script: "npm",
      args: "run start:stg",
      watch: true,
      env: {
        API_PORT: "3000",
        NODE_BASE_URL: "/api/v1",
        GOOGLE_MAPS_API: "AIzaSyCww53qH4bTw9z2le42RZu0QFam20AiuyU",
        MONGO_URL: "mongodb://localhost:27017",
        MONGO_INITDB_ROOT_USERNAME: "root",
        MONGO_INITDB_ROOT_PASSWORD: "password",
        MONGO_INITDB_DATABASE: "cadterreiros"
      }
    }
  ]
};
