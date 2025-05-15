import admin from 'firebase-admin';

const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;

// Replace the placeholder @ with real newline \n before parsing
const serviceAccount = JSON.parse(
  serviceAccountStr
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
