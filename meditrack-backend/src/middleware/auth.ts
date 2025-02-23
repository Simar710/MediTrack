import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

const serviceAccount = require("../../firebase/firebase-admin-sdk.json");
console.log('Resolved Path:', serviceAccount);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.split("Bearer ")[1] : null;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // Using non-null assertions to tell TypeScript these values are defined.
    req.user = { 
      id: decodedToken.uid!, 
      email: decodedToken.email!, 
      role: decodedToken.role! 
    };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};
