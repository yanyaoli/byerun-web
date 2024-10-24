import { defineConfig } from "@vue/cli-service";

export default defineConfig({
  lintOnSave: false,
  transpileDependencies: true,
  productionSourceMap: false,
  outputDir: "dist",
  publicPath: process.env.NODE_ENV === 'production'
    ? '/byerun-web/'
    : './'
});