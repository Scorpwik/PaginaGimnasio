# Gym Tracker

Aplicación de seguimiento de entrenamiento mobile-first con interfaz liquid glass, preparada para funcionar como PWA y para conectarse a Firebase.

## Desarrollo local

```bash
npm install
cp .env.example .env
npm run dev
```

La aplicación funciona en modo demo sin credenciales: las rutinas, sesiones, métricas y fotos se guardan en `localStorage` del navegador. Esto permite probar el producto en un gimnasio incluso antes de crear el proyecto de Firebase.

## Firebase

1. Crea una aplicación web en Firebase.
2. En Authentication → Sign-in method habilita **Anonymous** para la sincronización automática y **Email/Password** si quieres iniciar sesión manualmente desde Perfil.
3. Habilita Firestore y Storage.
4. En Replit, guarda la API key como el secreto `GOOGLE_API_KEY`. Los demás identificadores públicos de este proyecto ya están configurados como variables `VITE_FIREBASE_*`.
5. Para desarrollo fuera de Replit, copia las variables de `.env.example` a `.env` y completa `VITE_FIREBASE_API_KEY`.
6. Publica `firestore.rules` y `storage.rules` desde Firebase CLI.

El modelo está preparado para múltiples usuarios: cada documento incluye `userId` y las reglas restringen el acceso al usuario autenticado.

## Funcionalidades

- Rutinas CRUD con días, objetivos por ejercicio, búsqueda de librería, ejercicios custom y reordenamiento.
- Registro rápido de series con peso, repeticiones, estado, referencia de la sesión anterior, PR y timer de descanso con vibración.
- Métricas de peso corporal, volumen semanal, frecuencia, progresión e historial.
- Fotos desde cámara/galería, etiqueta, compresión en el cliente y comparación lado a lado.
- PWA instalable, caché básico offline y navegación responsive.
- Exportación de datos locales en JSON.

## GitHub Pages

El workflow `.github/workflows/deploy.yml` construye y publica en cada push a `main`. Configura estos Secrets en GitHub Actions:

`FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`.

En el repositorio, activa GitHub Pages usando **GitHub Actions** como fuente.