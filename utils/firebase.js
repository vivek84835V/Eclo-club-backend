import admin from 'firebase-admin';

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT,
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), // Uses parsed service account object
  });
}

export default admin;
