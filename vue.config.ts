import { defineConfig } from "@vue/cli-service";
import CompressionWebpackPlugin from "compression-webpack-plugin";

export default defineConfig({
  lintOnSave: true,
  transpileDependencies: true,
  productionSourceMap: false,
  configureWebpack: {
    performance: {
      hints: "warning",
      maxAssetSize: 512000, // 500 KiB
      maxEntrypointSize: 512000, // 500 KiB
    },
    optimization: {
      splitChunks: {
        chunks: "all",
        maxInitialRequests: Infinity,
        minSize: 20000, // 20 KiB
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `npm.${packageName.replace("@", "")}`;
            },
          },
        },
      },
    },
    plugins: [
      new CompressionWebpackPlugin({
        filename: "[path][base].gz",
        algorithm: "gzip",
        test: /\.(js|css|html|svg)$/,
        threshold: 10240, // 10 KiB
        minRatio: 0.8,
      }),
    ],
  },
});