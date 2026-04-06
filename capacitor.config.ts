import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.apuntador.app',
  appName: 'Apuntador',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
