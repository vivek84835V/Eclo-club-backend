const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNTS;

if (!base64ServiceAccount) {
  throw new Error("❌ FIREBASE_SERVICE_ACCOUNTS is missing.");
}

const serviceAccount = JSON.parse(Buffer.from(base64ServiceAccount, 'base64').toString('utf-8'));

// Firebase Admin initialization
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
