import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyBHHkgs8r_NelrV7xDd_SD0p67-HBFvEAg',
  authDomain: 'bookingviewtanarena.firebaseapp.com',
  databaseURL: 'https://bookingviewtanarena-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'bookingviewtanarena',
  storageBucket: 'bookingviewtanarena.firebasestorage.app',
  messagingSenderId: '524767957686',
  appId: '1:524767957686:web:6358642c4abaac1ba88c17',
  measurementId: 'G-9H2WJ2YBRZ'
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)
