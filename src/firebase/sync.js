import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { db } from './config'

export async function loadUserCollection(name, uid) {
  if (!db || !uid) return []
  try {
    const snapshot = await getDocs(query(collection(db, name), where('userId', '==', uid)))
    console.log(`[Firestore Sync] Cargados ${snapshot.docs.length} documentos de ${name} para UID:`, uid)
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
  } catch (error) {
    console.error(`[Firestore Sync Error] Error al cargar la colección ${name}:`, error)
    return []
  }
}

export async function saveUserDocument(name, uid, value) {
  if (!db || !uid || !value?.id) {
    console.warn('[Firestore Sync Warning] Intento de guardado omitido. Faltan parametros (db, uid o value.id):', { hasDb: Boolean(db), uid, valueId: value?.id })
    return
  }
  try {
    await setDoc(doc(db, name, value.id), { ...value, userId: uid, updatedAt: new Date().toISOString() }, { merge: true })
    console.log(`[Firestore Sync Éxito] Guardado documento en ${name}/${value.id} para UID:`, uid)
  } catch (error) {
    console.error(`[Firestore Sync Error] Error al guardar documento en ${name}/${value.id}:`, error)
    throw error
  }
}

export async function deleteUserDocument(name, uid, id) {
  if (!db || !uid || !id) return
  await deleteDoc(doc(db, name, id))
}

export async function uploadUserPhoto(uid, file, photoId) {
  if (!uid || !file || !photoId) return null
  return null
}
