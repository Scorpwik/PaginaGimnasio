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


// Fuentes:
// 1. https://github.com/FideoKojima/DesafioFirebase-II
// 2. https://insengnewbie.tistory.com/m/469
// 3. https://github.com/AliSajid/jfgi
// 4. https://github.com/AliSajid/jfgi