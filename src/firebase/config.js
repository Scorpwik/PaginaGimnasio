import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBpcV_EzBVD8BAYgZxJktD2_9Ics1n3fls',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'gimnasio-70f9b.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'gimnasio-70f9b',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'gimnasio-70f9b.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '93403045274',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:93403045274:web:287726d2fa08ffc9efae23',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-5QRZD51X7R',
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId,
)

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const analyticsReady = app
  ? isAnalyticsSupported().then((supported) => supported ? getAnalytics(app) : null).catch(() => null)
  : Promise.resolve(null)

export const gymManager = {
  save: async (collection, id, data) => {
    localStorage.setItem(`${collection}_${id}`, JSON.stringify(data))

    if (db) {
      await setDoc(doc(db, `users/me/${collection}`, id), data, { merge: true })
    }
  },

  get: async (collection, id) => {
    const local = localStorage.getItem(`${collection}_${id}`)
    if (local) return JSON.parse(local)

    if (db) {
      const snap = await getDoc(doc(db, `users/me/${collection}`, id))
      if (snap.exists()) {
        localStorage.setItem(`${collection}_${id}`, JSON.stringify(snap.data()))
        return snap.data()
      }
    }

    return null
  },

  savePhotoLocal: (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result
      const existing = JSON.parse(localStorage.getItem('progressPhotos_list') || '{"photos":[]}')
      existing.photos.push({ url: base64String, date: new Date().toISOString().split('T')[0] })
      localStorage.setItem('progressPhotos_list', JSON.stringify(existing))
      resolve(base64String)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  }),
}
