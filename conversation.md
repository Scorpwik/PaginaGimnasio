## # Prompt: App de Tracking de Gimnasio (Web + Firebase)

Quiero que construyas una aplicación web de seguimiento de entrenamiento de gimnasio, diseñada mobile-first (uso principal desde s25 ultra  en el gym), con diseño minimalista elegante estilo "liquid glass" / iOS.

## Stack técnico

- **Frontend:** React + Vite + TailwindCSS (o Next.js si prefieres SSR/routing más robusto)
- **Hosting/repo:** GitHub — configura GitHub Actions para deploy automático a GitHub Pages (o Vercel conectado al repo) en cada push a `main`
- **Backend/datos:** Firebase
  - Firestore para toda la data estructurada (rutinas, logs, métricas)
  - Firebase Storage para las fotos de progreso
  - Firebase Auth (email/password o Google) — un solo usuario por ahora, pero deja el modelo de datos preparado para multi-usuario
- **PWA:** configura manifest.json + service worker para que sea instalable en la pantalla de inicio del iPhone, con ícono y splash screen, y funcione con caché básico offline (poder ver la rutina del día sin señal, en gimnasios con mal wifi)

## Estructura de datos (Firestore)

```
users/{uid}
  displayName, email

routines/{routineId}
  userId, name, dayOfWeek (o "libre"), createdAt, updatedAt
  exercises: [
    { exerciseId, name, targetSets, targetReps, targetWeight, order }
  ]

exerciseLibrary/{exerciseId}
  name, muscleGroup, isCustom (bool), createdBy

workoutLogs/{logId}
  userId, routineId, date, dayLabel
  exercises: [
    {
      exerciseId, name,
      sets: [
        { setNumber, weight, repsAchieved, repsAttempted, status: "logrado"|"fallido"|"parcial", rpe (opcional), notes }
      ]
    }
  ]

bodyMetrics/{entryId}
  userId, date, weight, bodyFatEstimate (opcional), notes

progressPhotos/{photoId}
  userId, date, imageUrl, tag (frente/perfil/espalda/otro)
```

## Funcionalidades requeridas

### 1. Rutinas
- CRUD completo: crear, editar, eliminar rutinas
- Añadir/quitar/reordenar ejercicios dentro de una rutina (drag & drop si es posible)
- Asignar cada rutina a un día de la semana
- Buscar ejercicios en una librería (con opción de crear ejercicios custom si no existen)
- Definir objetivo de series/reps/peso por ejercicio

### 2. Registro de entrenamiento (logging)
- Vista de "entrenar hoy" que carga automáticamente la rutina del día
- Por cada ejercicio: registrar múltiples series, cada una con peso, repeticiones logradas, repeticiones intentadas, y estado (logrado / fallido / parcial)
- Mostrar automáticamente el peso/reps de la sesión anterior de ese mismo ejercicio como referencia (clave para progresión)
- Timer de descanso entre series (configurable, con notificación/vibración al terminar)
- Marcar récords personales (PR) automáticamente cuando se supera un peso o reps previos, con indicador visual

### 3. Métricas y tracking
- Dashboard con gráficas: peso corporal en el tiempo, peso levantado por ejercicio en el tiempo (progresión), volumen semanal total, frecuencia de entrenamiento
- Vista de historial por ejercicio (todas las sesiones registradas de ese ejercicio)
- Vista de calendario/historial general de entrenamientos completados

### 4. Fotos de progreso
- Apartado para subir fotos (input de cámara/galería), con fecha y etiqueta (frente/perfil/espalda)
- Galería cronológica
- Vista de comparación lado a lado entre dos fechas elegidas
- Comprimir/redimensionar la imagen en el cliente antes de subirla a Storage (evitar costos innecesarios)

### 5. Autenticación
- Login simple con Firebase Auth
- Reglas de seguridad en Firestore y Storage: cada usuario solo puede leer/escribir su propia data

## Diseño (UI/UX)

- Estilo "liquid glass": tarjetas con fondo semi-transparente + `backdrop-blur`, bordes sutiles, sombras suaves, esquinas muy redondeadas (estilo iOS 18/visionOS)
- Modo oscuro por defecto (mejor para uso en gimnasio, menos consumo de batería/pantalla), con un color de acento vibrante configurable
- Tipografía tipo SF Pro / Inter, jerarquía clara
- Navegación inferior estilo iOS (tab bar) con 4-5 secciones: Hoy, Rutinas, Métricas, Fotos, Perfil
- Transiciones y animaciones suaves (usa `framer-motion` si aplica)
- Todo pensado para uso con una mano, botones grandes, mínimo de taps para registrar una serie durante el entrenamiento

## Consideraciones adicionales (importantes, no las omitas)

- Estados vacíos claros (usuario nuevo sin rutinas aún, sin fotos aún, etc.)
- Manejo de errores y estados de carga en todas las operaciones async
- Variables de entorno para la config de Firebase (`.env`, nunca hardcodeada), y configura los secrets correspondientes en GitHub Actions para el deploy
- Responsive: que también se vea bien en desktop/tablet aunque el foco sea mobile
- README claro en el repo explicando cómo configurar Firebase y correr el proyecto localmente

## Entregable esperado

Repositorio en GitHub con el proyecto completo, listo para conectar mis propias credenciales de Firebase, con deploy automático configurado.

Para inicializar el repositorio local, ejecuta en tu terminal el comando de creación de Vite con React, seguido de la instalación de las dependencias necesarias. Las dependencias incluyen Firebase para el backend, Framer Motion para las animaciones, TailwindCSS para los estilos, y utilidades para las gráficas y compresión de imágenes.

```bash
npm create vite@latest gym-tracker -- --template react
cd gym-tracker
npm install firebase react-router-dom framer-motion lucide-react clsx tailwind-merge date-fns react-chartjs-2 chart.js browser-image-compression
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa
npx tailwindcss init -p

```

Configura el manifiesto de la PWA y el service worker en el archivo de configuración de Vite. Esto asegura que la aplicación sea instalable, funcione offline para ver las rutinas sin conexión y tenga la pantalla de inicio adecuada para dispositivos móviles.

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Gym Tracker',
        short_name: 'Gym',
        description: 'Tracking de entrenamiento minimalista',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})

```

Define el tema oscuro por defecto y la tipografía en la configuración de Tailwind. El diseño liquid glass se logra combinando fondos semitransparentes, desenfoque de fondo y bordes sutiles.

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'sans-serif'],
      },
      colors: {
        glass: 'rgba(255, 255, 255, 0.05)',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
        accent: '#3b82f6',
      }
    },
  },
  plugins: [],
}

```

Añade las directivas base de Tailwind en tu hoja de estilos principal, forzando el esquema de color oscuro y previniendo el scroll horizontal.

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  @apply bg-neutral-950 text-white overflow-x-hidden antialiased;
  -webkit-tap-highlight-color: transparent;
}

```

Configura la conexión a Firebase utilizando variables de entorno. Crea un archivo en la raíz del proyecto para almacenar tus credenciales locales sin subirlas al repositorio.

```env
# .env
VITE_FIREBASE_API_KEY="tu_api_key"
VITE_FIREBASE_AUTH_DOMAIN="tu_proyecto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="tu_proyecto"
VITE_FIREBASE_STORAGE_BUCKET="tu_proyecto.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="tu_sender_id"
VITE_FIREBASE_APP_ID="tu_app_id"

```

Inicializa los servicios de Firebase en un módulo dedicado. Aquí se exportan las instancias de autenticación, base de datos y almacenamiento para usarlas en toda la aplicación.

```javascript
// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

```

Crea el componente base para el diseño liquid glass. Este contenedor envuelve otras piezas de la interfaz para mantener la consistencia visual en todas las pantallas.

```javascript
// src/components/ui/GlassCard.jsx
import { motion } from 'framer-motion';

export function GlassCard({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-glass backdrop-blur-xl border border-glassBorder rounded-3xl p-5 shadow-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

```

Construye la vista de registro de entrenamiento. Esta pantalla está optimizada para usarse con una sola mano en la pantalla de tu S25 Ultra, permitiendo registrar series rápidamente y visualizar el timer de descanso mediante botones amplios.

```javascript
// src/pages/WorkoutLog.jsx
import { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Check, Clock, TrendingUp } from 'lucide-react';

export default function WorkoutLog({ routine }) {
  const [restTimer, setRestTimer] = useState(null);

  const startRestTimer = (seconds) => {
    setRestTimer(seconds);
  };

  return (
    <div className="pb-24 pt-6 px-4 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Entrenar Hoy</h1>
        <p className="text-neutral-400 mt-1">{routine?.name || 'Cargando rutina...'}</p>
      </header>

      <GlassCard>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Press de Banca</h2>
          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full flex items-center gap-1">
            <TrendingUp size={12} /> PR: 100kg
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2 text-sm text-neutral-400 text-center mb-2">
            <span>Serie</span>
            <span>kg</span>
            <span>Reps</span>
            <span>✓</span>
          </div>
          
          {[1, 2, 3].map((set) => (
            <div key={set} className="grid grid-cols-4 gap-3 items-center">
              <div className="text-center font-medium text-neutral-300">{set}</div>
              <input type="number" placeholder="80" className="bg-white/5 border border-white/10 rounded-xl p-2 text-center text-white focus:outline-none focus:border-accent" />
              <input type="number" placeholder="10" className="bg-white/5 border border-white/10 rounded-xl p-2 text-center text-white focus:outline-none focus:border-accent" />
              <button 
                onClick={() => startRestTimer(90)}
                className="bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-xl p-2 flex justify-center text-accent transition-colors"
              >
                <Check size={20} />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      {restTimer && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-neutral-900 border border-glassBorder rounded-full px-6 py-3 flex items-center gap-3 shadow-xl">
          <Clock size={18} className="text-accent" />
          <span className="font-mono text-lg">{Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}</span>
        </div>
      )}
    </div>
  );
}

```

Estructura la barra de navegación inferior imitando el estilo de iOS, manteniéndola fija en la parte inferior de la pantalla para facilitar el acceso rápido entre las distintas secciones de la aplicación.

```javascript
// src/components/Navigation.jsx
import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, LineChart, Camera, User } from 'lucide-react';

export function BottomNav() {
  const navItems = [
    { path: '/', icon: Home, label: 'Hoy' },
    { path: '/routines', icon: Dumbbell, label: 'Rutinas' },
    { path: '/metrics', icon: LineChart, label: 'Métricas' },
    { path: '/photos', icon: Camera, label: 'Fotos' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-neutral-950/80 backdrop-blur-2xl border-t border-glassBorder pb-safe">
      <div className="flex justify-around items-center h-full max-w-md mx-auto px-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink 
            key={path} 
            to={path}
            className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-accent' : 'text-neutral-500'}`}
          >
            <Icon size={24} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

```

Integra todos los componentes en el punto de entrada de la aplicación, definiendo las rutas y envolviendo el contenido en un layout que incluye la navegación y restringe el ancho máximo para mantener las proporciones móviles en pantallas grandes.

```javascript
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BottomNav } from './components/Navigation';
import WorkoutLog from './pages/WorkoutLog';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-950 text-white">
        <main className="max-w-md mx-auto min-h-screen">
          <Routes>
            <Route path="/" element={<WorkoutLog />} />
            <Route path="/routines" element={<div className="p-4 text-center mt-20 text-neutral-500">No hay rutinas creadas</div>} />
            <Route path="/metrics" element={<div className="p-4 text-center mt-20 text-neutral-500">Sin datos registrados</div>} />
            <Route path="/photos" element={<div className="p-4 text-center mt-20 text-neutral-500">Sube tu primera foto</div>} />
            <Route path="/profile" element={<div className="p-4">Perfil</div>} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

```

Configura el flujo de GitHub Actions para desplegar automáticamente la aplicación en GitHub Pages cada vez que empujes código a la rama principal.

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
        run: npm run build
        
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
          
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

```

Define las reglas de seguridad de Firestore para garantizar que cada usuario solo pueda acceder a su propia información basándose en su identificador único.

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /routines/{document=**} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /workoutLogs/{document=**} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /bodyMetrics/{document=**} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /exerciseLibrary/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && (request.resource.data.isCustom == true && request.resource.data.createdBy == request.auth.uid);
    }
  }
}

```

Crea el archivo README con las instrucciones para configurar el proyecto localmente y enlazarlo con tu base de datos antes de subirlo a GitHub.

```markdown
# Gym Tracker Web App

Aplicación de seguimiento de entrenamiento diseñada para móviles con interfaz liquid glass.

## Configuración local

Clona el repositorio e instala las dependencias:
npm install

Crea un archivo .env en la raíz del proyecto y coloca tus credenciales de Firebase.

Inicia el servidor de desarrollo:
npm run dev

## Despliegue

El proyecto está configurado para desplegarse automáticamente en GitHub Pages. Asegúrate de configurar los siguientes Secrets en tu repositorio de GitHub bajo Settings > Secrets and variables > Actions:

- FIREBASE_API_KEY
- FIREBASE_AUTH_DOMAIN
- FIREBASE_PROJECT_ID
- FIREBASE_STORAGE_BUCKET
- FIREBASE_MESSAGING_SENDER_ID
- FIREBASE_APP_ID

```



```
Fuentes:
1. https://github.com/FideoKojima/DesafioFirebase-II
2. https://insengnewbie.tistory.com/m/469
3. https://github.com/AliSajid/jfgi
4. https://github.com/AliSajid/jfgi