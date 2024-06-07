const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  lintOnSave: true,
  transpileDependencies: true,
  productionSourceMap: false,
});
