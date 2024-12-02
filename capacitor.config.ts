import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dealgoricoionic.app', // Cambia esto para que coincida con el nuevo package_name
  appName: 'DeAlgoricoIonic',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '866279976542-f1vip3bh5s8r1m7nbnjsmts2kmrkdrip.apps.googleusercontent.com', // client_type 3
      // androidClientId: '866279976542-f1vip3bh5s8r1m7nbnjsmts2kmrkdrip.apps.googleusercontent.com',
      // androidClientId: '866279976542-nf3il2rdesj4j00srovr2nukrd98nkn2.apps.googleusercontent.com', // El nuevo para Android
      forceCodeForRefreshToken: true,
      
    }
  }
};

export default config;