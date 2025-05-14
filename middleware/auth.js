import admin from '../utils/firebase.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: process.env.NODE_ENV === "production" ? "Unauthorized" : "Malformed authorization header"
    });
  }

  const token = authHeader.split(" ")[1]?.trim();

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Authentication error:", err);
    }

    const message =
      err.code === "auth/id-token-expired"
        ? process.env.NODE_ENV === "production"
          ? "Token expired"
          : "Invalid or expired token"
        : process.env.NODE_ENV === "production"
        ? "Unauthorized"
        : "Invalid token";

    return res.status(401).json({ message });
  }
};
