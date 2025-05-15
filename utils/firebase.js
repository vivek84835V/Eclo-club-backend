import admin from 'firebase-admin';

const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountStr) {
  throw new Error("❌ FIREBASE_SERVICE_ACCOUNT env variable is missing.");
}

const serviceAccount = JSON.parse(
  serviceAccountStr.replace(/@/g, '\n') // replace all @ with newline
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
