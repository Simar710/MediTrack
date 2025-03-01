// app/prescriptions/page.tsx
"use client";
import { useEffect, useState, FormEvent } from "react";
import axios from "axios";
import { auth } from "../../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [prescriptionName, setPrescriptionName] = useState("");
  const [dosage, setDosage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPrescriptions(response.data);
      }
    });
    return () => unsubscribe();
  }, []);

  const createPrescription = async (e: FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions`,
        { name: prescriptionName, dosage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPrescriptions([...prescriptions, response.data]);
      setPrescriptionName("");
      setDosage("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-card p-8 rounded-lg shadow-lg">
        <h2 className="text-4xl font-bold text-center mb-8">Prescriptions</h2>
        <form onSubmit={createPrescription} className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Add Prescription</h3>
          <input
            type="text"
            placeholder="Prescription Name"
            value={prescriptionName}
            onChange={(e) => setPrescriptionName(e.target.value)}
            className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="text"
            placeholder="Dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded transition">
            Add Prescription
          </button>
        </form>
        <div>
          <h3 className="text-2xl font-semibold mb-4">Your Prescriptions</h3>
          {prescriptions.length === 0 ? (
            <p className="text-gray-500">No prescriptions found.</p>
          ) : (
            <ul className="divide-y divide-gray-300">
              {prescriptions.map((p: any) => (
                <li key={p.id} className="py-4">
                  <p className="text-xl font-medium">{p.name}</p>
                  <p className="text-sm text-gray-500">{p.dosage} — {p.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
