import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bokharest.apple',
  appName: 'بوخارست بلاك',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0a0a0a',
    preferredContentMode: 'mobile'
  }
};

export default config;
