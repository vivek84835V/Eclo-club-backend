import admin from 'firebase-admin';

const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountStr),
  });
}

export default admin;
