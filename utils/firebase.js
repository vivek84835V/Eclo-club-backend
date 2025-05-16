import admin from "firebase-admin"

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNTS;

if (!serviceAccountBase64) {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNTS");
}

const jsonString = Buffer.from(serviceAccountBase64, "base64").toString("utf8");

// ✅ Parse the JSON
const serviceAccount = JSON.parse(jsonString);

// ✅ Fix private_key line breaks
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

// ✅ Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;