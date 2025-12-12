import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js"
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js"
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js"

import { fbCfg } from "./config.js"

const app = initializeApp(fbCfg)
export const auth = getAuth(app)
setPersistence(auth, browserLocalPersistence).catch(() => {})
export const db = getFirestore(app)

export const fb = {
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp
}

export const authApi = { onAuthStateChanged, signInAnonymously }
