module.exports = {
  apps: [{
    name: "byerun-autorun",
    script: "./server.js",
    watch: false,
    env: {
      NODE_ENV: "production",
      PORT: 5891
    }
  }]
}
