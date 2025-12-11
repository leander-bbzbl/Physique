import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.physique.app',
  appName: 'Physique',
  webDir: 'www',
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    },
    allowMixedContent: true,
    icon: 'src/assets/icon.png',
    splash: {
      image: 'src/assets/splash.png',
      backgroundColor: '#000000',
      resizeMode: 'contain'
    }
  }
};

export default config;