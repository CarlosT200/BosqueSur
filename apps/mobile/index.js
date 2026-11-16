import { registerRootComponent } from 'expo';
import App from './App.js';

// registerRootComponent llama a AppRegistry.registerComponent('main', () => App)
// y configura el entorno correctamente tanto en Expo Go como en builds nativas.
registerRootComponent(App);
