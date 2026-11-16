import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.byerun.web',
  appName: 'Byerun',
  webDir: 'dist',
  android: { allowMixedContent: true },
};

export default config;
