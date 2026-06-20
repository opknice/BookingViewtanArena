# Security Improvements Needed

## 🔴 CRITICAL - Firebase Security

### Current Issues:
1. Firebase credentials are exposed in `src/config/firebase.js`
2. Admin password is hardcoded in `src/components/AdminLoginModal.jsx`
3. No Firebase Security Rules implemented

### Recommended Actions:

#### 1. Move Firebase Config to Environment Variables

**Step 1:** Create a `.env` file (already in .gitignore):
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_ADMIN_PASSWORD=your_secure_password
```

**Step 2:** Update `src/config/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}
```

**Step 3:** Update `src/components/AdminLoginModal.jsx`:
```javascript
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '55555'
```

#### 2. Implement Firebase Security Rules

Add these rules in Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    "bookings": {
      ".read": true,
      ".write": false,
      "$bookingId": {
        ".write": "!data.exists() || (!newData.exists() && auth != null)"
      }
    }
  }
}
```

**Better approach:** Implement Firebase Authentication for admin users:
```json
{
  "rules": {
    "bookings": {
      ".read": true,
      "$bookingId": {
        ".write": "!data.exists() || (auth != null && root.child('admins').child(auth.uid).exists())"
      }
    },
    "admins": {
      ".read": "auth != null",
      ".write": false
    }
  }
}
```

#### 3. Use Firebase Authentication (Recommended)

Instead of hardcoded password, use Firebase Auth:

```bash
npm install firebase
```

Create `src/hooks/useAuth.js`:
```javascript
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../config/firebase'

export function useAuth() {
  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    return await signOut(auth)
  }

  return { login, logout }
}
```

---

## 📋 Additional Security Recommendations

1. **Rate Limiting:** Add rate limiting to prevent spam bookings
2. **Input Sanitization:** Already done with `normalizePhone()` and `trim()`
3. **HTTPS Only:** Ensure your deployment uses HTTPS (Vercel does this by default)
4. **CORS:** Configure Firebase to only accept requests from your domain
5. **Monitoring:** Set up Firebase Security Rules monitoring and alerts

---

## ✅ Security Fixes Already Applied

1. ✅ Added error handling to all Firebase operations
2. ✅ Fixed memory leaks in useEffect hooks
3. ✅ Added input validation for phone numbers and names
4. ✅ Added null checks in Telegram notifications
5. ✅ Removed unused imports that could confuse security audits
6. ✅ Added proper error messages for failed operations

---

## 🔒 Deploy Checklist

Before deploying to production:

- [ ] Move all credentials to environment variables
- [ ] Set up Firebase Security Rules
- [ ] Consider implementing Firebase Authentication
- [ ] Enable Firebase App Check for DDoS protection
- [ ] Review and test all error handling paths
- [ ] Set up monitoring and alerting
- [ ] Test with production-like data volumes
- [ ] Verify HTTPS is enforced
- [ ] Document emergency contact procedures
