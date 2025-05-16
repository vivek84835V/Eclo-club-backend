<<<<<<< HEAD
const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNTS;
=======
import admin from 'firebase-admin';

const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountStr) {
  throw new Error("❌ FIREBASE_SERVICE_ACCOUNT env variable is missing.");
}

const serviceAccount = JSON.parse(
  serviceAccountStr.replace(/@/g, '\n') // replace all @ with newline
);
>>>>>>> 4dcdf5c4f1edfe4a8c888c3787de87dbba97bc4d

if (!base64ServiceAccount) {
  throw new Error("❌ FIREBASE_SERVICE_ACCOUNT is missing.");
}

const serviceAccount = JSON.parse(Buffer.from(base64ServiceAccount, 'base64').toString('utf-8'));

// Firebase Admin initialization
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
