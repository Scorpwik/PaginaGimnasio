import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from './config'

export async function loadUserCollection(name, uid) {
  if (!db || !uid) return []
  const snapshot = await getDocs(query(collection(db, name), where('userId', '==', uid)))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function saveUserDocument(name, uid, value) {
  if (!db || !uid || !value?.id) return
  await setDoc(doc(db, name, value.id), { ...value, userId: uid, updatedAt: new Date().toISOString() }, { merge: true })
}

export async function uploadUserPhoto(uid, file, photoId) {
  if (!storage || !uid || !file) return null
  const fileRef = ref(storage, `progressPhotos/${uid}/${photoId}.jpg`)
  await uploadBytes(fileRef, file, { contentType: 'image/jpeg' })
  return getDownloadURL(fileRef)
}