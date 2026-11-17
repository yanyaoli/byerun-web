import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.byerun.web',
  appName: 'Byerun',
  webDir: 'dist',
  android: { allowMixedContent: true },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
