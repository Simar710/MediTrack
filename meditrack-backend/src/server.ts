// server.ts
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

// Extend Express Request interface to include "user"
declare global {
    namespace Express {
        interface Request {
            user?: { id: string; role: string; email: string };
        }
    }
}

// TEST API
app.get("/", (req: Request, res: Response): void => {
    res.send("MediTrack Backend Running");
});

// GET Profile – returns the user record from the database
app.get("/api/profile", authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json(user);
    } catch (error) {
        console.error("Error retrieving profile:", error);
        res.status(500).json({ error: "Error retrieving profile" });
    }
});

// GET Prescriptions (for both patients and pharmacists)
app.get("/prescriptions", authMiddleware, async (req: Request, res: Response): Promise<void> => {
    const user = req.user!;
    try {
        const prescriptions =
            user.role === "pharmacist"
                ? await prisma.prescription.findMany({
                    include: { patient: true }, // This loads the patient details
                })
                : await prisma.prescription.findMany({ where: { patientId: user.id } });
        res.json(prescriptions);
    } catch (error) {
        console.error("Error fetching prescriptions:", error);
        res.status(500).json({ error: "Failed to fetch prescriptions" });
    }
});

app.put("/prescriptions/:id/reject", authMiddleware, async (req: Request, res: Response): Promise<void> => {
    const user = req.user!;
    if (user.role !== "pharmacist") {
        res.status(403).json({ error: "Only pharmacists can reject prescriptions" });
        return;
    }
    try {
        const prescription = await prisma.prescription.update({
            where: { id: req.params.id },
            data: { status: "rejected", pharmacistId: user.id }
        });
        res.json(prescription);
    } catch (error) {
        console.error("Error rejecting prescription:", error);
        res.status(500).json({ error: "Error rejecting prescription" });
    }
});

// ADD Prescription (for patients only)
app.post("/prescriptions", authMiddleware, async (req: Request, res: Response): Promise<void> => {
    const user = req.user!;
    if (user.role !== "patient") {
        res.status(403).json({ error: "Only patients can create prescriptions" });
        return;
    }
    const { name, dosage } = req.body;
    try {
        const prescription = await prisma.prescription.create({
            data: {
                name,
                dosage,
                status: "pending",
                patientId: user.id  // Uses the logged-in user's UID
            }
        });
        res.json(prescription);
    } catch (error) {
        console.error("Error creating prescription:", error);
        res.status(500).json({ error: "Error creating prescription" });
    }
});

// APPROVE Prescription (for pharmacists only)
app.put("/prescriptions/:id/approve", authMiddleware, async (req: Request, res: Response): Promise<void> => {
    const user = req.user!;
    if (user.role !== "pharmacist") {
        res.status(403).json({ error: "Only pharmacists can approve prescriptions" });
        return;
    }
    try {
        const prescription = await prisma.prescription.update({
            where: { id: req.params.id },
            data: { status: "approved", pharmacistId: user.id }
        });
        res.json(prescription);
    } catch (error) {
        console.error("Error approving prescription:", error);
        res.status(500).json({ error: "Error approving prescription" });
    }
});

// CREATE USER (Using the authenticated Firebase UID and provided role)
// Note: This endpoint is now allowed to run even if no user record exists yet.
app.post("/api/create-user", authMiddleware, async (req: Request, res: Response): Promise<void> => {
    const { email, name, role } = req.body;
    const firebaseUid = req.user!.id;

    if (!["patient", "pharmacist"].includes(role)) {
        res.status(400).json({ error: "Invalid role. Must be 'patient' or 'pharmacist'." });
        return;
    }

    try {
        const user = await prisma.user.create({
            data: {
                id: firebaseUid,
                email,
                name,
                role,
            },
        });
        res.status(201).json(user);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Error creating user" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
