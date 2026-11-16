# Versión Expo Snack (archivo único)

`App.js` de esta carpeta es la app móvil de BosqueSur consolidada en **un solo
archivo**, pensada para ejecutarse en [Expo Snack](https://snack.expo.dev) sin
instalar nada: se pega en el editor de Snack y se abre en el teléfono con Expo Go.

Apunta a la API desplegada: `https://bosquesur-api.onrender.com/api`.
El token JWT se mantiene en memoria (no usa SecureStore) para simplificar el demo.

La app móvil "real" (multi-archivo, para `npx expo start`) está en `apps/mobile/`.
