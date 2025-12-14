import { initializeApp } from "https:
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  setPersistence,
  browserLocalPersistence
} from "https:
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
} from "https:

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
