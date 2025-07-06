import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyDQSIRc9ZvW72SmZ2uy3WorAg2o7FtChag",
  authDomain: "squadgame-182a0.firebaseapp.com",
  databaseURL: "https://squadgame-182a0-default-rtdb.firebaseio.com",
  projectId: "squadgame-182a0",
  storageBucket: "squadgame-182a0.firebasestorage.app",
  messagingSenderId: "296563423628",
  appId: "1:296563423628:web:c45a1d939b26f0f68b3ea9",
  measurementId: "G-04W4NQK6CT",
}

let app
let auth
let database

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  database = getDatabase(app)
} catch (error) {
  console.error("Firebase initialization error:", error)
  // Create mock objects for development
  auth = null
  database = null
}

export { auth, database }
