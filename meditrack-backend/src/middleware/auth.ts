// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const serviceAccount = require("../../firebase/service-account-file.json");
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
    // Look up the user record by Firebase UID.
    const userRecord = await prisma.user.findUnique({ where: { id: decodedToken.uid } });
    if (!userRecord) {
      // Allow create-user endpoint even if no record exists yet.
      if (req.path === "/api/create-user" && req.method === "POST") {
        req.user = { id: decodedToken.uid, email: decodedToken.email!, role: "" };
        next();
        return;
      }
      res.status(404).json({ error: "User not found in database" });
      return;
    }
    req.user = { 
      id: decodedToken.uid, 
      email: decodedToken.email!,
      role: userRecord.role  // "patient" or "pharmacist"
    };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};
