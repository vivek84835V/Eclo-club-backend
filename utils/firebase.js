import admin from 'firebase-admin';

const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNTS;

if (!base64ServiceAccount) {
  throw new Error("❌ FIREBASE_SERVICE_ACCOUNTS is missing.");
}

const serviceAccount = JSON.parse(Buffer.from(base64ServiceAccount, 'base64').toString('utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


export default admin;