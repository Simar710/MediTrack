import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "./middleware/auth";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Extend Express Request interface to include the "user" property.
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string; email: string };
    }
  }
}

// TEST API
app.get("/", (req: Request, res: Response): void => {
  res.send("MediTrack Backend Running 🚀");
});

// GET Prescriptions (For Patients & Pharmacists)
app.get(
  "/prescriptions",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user!;
    let prescriptions;
    if (user.role === "pharmacist") {
      prescriptions = await prisma.prescription.findMany();
    } else {
      prescriptions = await prisma.prescription.findMany({
        where: { patientId: user.id }
      });
    }
    res.json(prescriptions);
  }
);

// ADD Prescription (Patient)
app.post(
  "/prescriptions",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user!;
    if (user.role !== "patient") {
      res.status(403).json({ error: "Only patients can create prescriptions" });
      return;
    }
    const { name, dosage } = req.body;
    const prescription = await prisma.prescription.create({
      data: { name, dosage, status: "pending", patientId: user.id }
    });
    res.json(prescription);
  }
);

// APPROVE Prescription (Pharmacist)
app.put(
  "/prescriptions/:id/approve",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user!;
    if (user.role !== "pharmacist") {
      res.status(403).json({ error: "Only pharmacists can approve prescriptions" });
      return;
    }
    const prescription = await prisma.prescription.update({
      where: { id: req.params.id },
      data: { status: "approved", pharmacistId: user.id }
    });
    res.json(prescription);
  }
);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
