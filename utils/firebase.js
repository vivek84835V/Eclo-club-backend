import admin from "firebase-admin";

// Decode Base64 string from environment variable
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNTS;

if (!serviceAccountBase64) {
  throw new Error("FIREBASE_SERVICE_ACCOUNTS is not defined");
}

let serviceAccount;
try {
  const serviceAccountJson = Buffer.from(serviceAccountBase64, "base64").toString("utf8");
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (err) {
  throw new Error("Failed to decode Firebase service account: " + err.message);
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;