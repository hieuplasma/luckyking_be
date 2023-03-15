module.exports = {
    apps : [{
      name: "luckyking-services",
      script: "./dist/main.js",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }]
  }