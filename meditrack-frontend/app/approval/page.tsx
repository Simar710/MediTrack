// app/approval/page.tsx
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Approval() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [role, setRole] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        const profileResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRole(profileResponse.data.role);
        if (profileResponse.data.role === "pharmacist") {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setPrescriptions(response.data);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const approvePrescription = async (id: string) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPrescriptions(response.data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-card p-8 rounded-lg shadow-lg">
        <h2 className="text-4xl font-bold text-center mb-8">Approval</h2>
        {role !== "pharmacist" ? (
          <p className="text-center text-red-500">Access Denied. Only pharmacists can approve prescriptions.</p>
        ) : (
          <>
            {prescriptions.length === 0 ? (
              <p className="text-gray-500 text-center">No prescriptions to approve.</p>
            ) : (
              <ul className="divide-y divide-gray-300">
                {prescriptions.map((p: any) => (
                  <li key={p.id} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="text-xl font-medium">{p.name}</p>
                      <p className="text-sm text-gray-500">{p.dosage} — {p.status}</p>
                    </div>
                    {p.status === "pending" && (
                      <button
                        onClick={() => approvePrescription(p.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
                      >
                        Approve
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
