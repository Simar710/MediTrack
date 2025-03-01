"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();

        // Fetch profile
        try {
          const profileResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setProfile(profileResponse.data);
        } catch (error) {
          console.error("Error fetching profile:", error);
        }

        // Fetch prescriptions
        try {
          const presResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setPrescriptions(presResponse.data);
        } catch (error) {
          console.error("Error fetching prescriptions:", error);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // -------------------------
  // PATIENT ACTION: ADD
  // -------------------------
  const handleAddPrescription = async () => {
    if (!medicineName.trim() || !dosage.trim()) return;
    const token = await auth.currentUser?.getIdToken();
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions`,
        { name: medicineName, dosage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMedicineName("");
      setDosage("");
      alert("Prescription added successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error adding prescription:", error);
    }
  };

  // -------------------------
  // PHARMACIST ACTIONS: APPROVE / REJECT
  // -------------------------
  const handleApprove = async (id: string) => {
    const token = await auth.currentUser?.getIdToken();
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Prescription approved!");
      window.location.reload();
    } catch (error) {
      console.error("Error approving prescription:", error);
    }
  };

  const handleReject = async (id: string) => {
    const token = await auth.currentUser?.getIdToken();
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Prescription rejected!");
      window.location.reload();
    } catch (error) {
      console.error("Error rejecting prescription:", error);
    }
  };

  // -------------------------
  // DASHBOARD METRICS
  // -------------------------
  const total = prescriptions.length;
  const pending = prescriptions.filter((p) => p.status === "pending").length;
  const approved = prescriptions.filter((p) => p.status === "approved").length;
  const rejected = prescriptions.filter((p) => p.status === "rejected").length;

  return (
    /**
     * Body already has the gradient from global.css:
     *   background: linear-gradient(to right, var(--primary-bg-start), var(--primary-bg-end));
     *   color: var(--text-color);
     */
    <div className="min-h-screen px-4 py-8">
      {/**
       * Main container uses "bg-card" from global.css,
       * which resolves to #ffffff in light mode (or #1e2a33 in dark mode).
       * Add some nice styling (rounded corners, shadow, etc.).
       */}
      <div className="max-w-5xl mx-auto bg-card rounded-2xl shadow-2xl p-8 border border-[var(--accent-color)]/40">
        {/**
         * A fancy gradient text for the heading:
         * - We use text-transparent + bg-clip-text for a gradient effect on the text.
         */}
        <h2 className="text-4xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
          Dashboard
        </h2>

        {/* USER INFO */}
        {profile && (
          <div className="mb-6 border-b border-[var(--accent-color)]/40 pb-4">
            <p className="text-xl mb-1"><strong>Name:</strong> {profile.name}</p>
            <p className="text-xl mb-1"><strong>Email:</strong> {profile.email}</p>
            <p className="text-xl"><strong>Role:</strong> {profile.role}</p>
          </div>
        )}

        {/* Dashboard Summary */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-xl shadow-lg flex flex-col items-center text-white">
            <p className="text-xl font-semibold">Total</p>
            <p className="text-3xl font-bold">{total}</p>
          </div>

          {/* Pending */}
          <div className="bg-gradient-to-br from-yellow-500 to-amber-500 p-4 rounded-xl shadow-lg flex flex-col items-center text-white">
            <p className="text-xl font-semibold">Pending</p>
            <p className="text-3xl font-bold">{pending}</p>
          </div>

          {/* Approved */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-xl shadow-lg flex flex-col items-center text-white">
            <p className="text-xl font-semibold">Approved</p>
            <p className="text-3xl font-bold">{approved}</p>
          </div>

          {/* Rejected */}
          <div className="bg-gradient-to-br from-red-500 to-pink-500 p-4 rounded-xl shadow-lg flex flex-col items-center text-white">
            <p className="text-xl font-semibold">Rejected</p>
            <p className="text-3xl font-bold">{rejected}</p>
          </div>
        </div>

        {/* PATIENT VIEW */}
        {profile?.role === "patient" && (
          <>
            {/* ADD PRESCRIPTION */}
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-indigo-500">Add Prescription</h3>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="Medicine name"
                  className="w-full p-3 border rounded"
                />
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="Dosage"
                  className="w-full p-3 border rounded"
                />
              </div>
              <button
                onClick={handleAddPrescription}
                className="mt-4 w-full py-3 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 transition"
              >
                Submit
              </button>
            </div>

            {/* PATIENT PRESCRIPTIONS */}
            <div className="mt-8">
              <h3 className="text-2xl font-semibold text-indigo-500 mb-4">Your Prescriptions</h3>
              {prescriptions.length > 0 ? (
                <ul className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <li
                      key={prescription.id}
                      className="p-4 rounded-md shadow border border-[var(--accent-color)]/30 bg-card"
                    >
                      <p><strong>Medicine:</strong> {prescription.name}</p>
                      <p><strong>Dosage:</strong> {prescription.dosage}</p>
                      <p>
                        <strong>Status:</strong> {prescription.status}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Created At:</strong>{" "}
                        {new Date(prescription.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No prescriptions added yet.</p>
              )}
            </div>
          </>
        )}

        {/* PHARMACIST VIEW */}
        {profile?.role === "pharmacist" && (
          <div className="mt-8">
            <h3 className="text-2xl font-semibold text-indigo-500 mb-4">Pending Prescriptions</h3>
            {prescriptions.length > 0 ? (
              <ul className="space-y-4">
                {prescriptions.map((prescription) => (
                  <li
                    key={prescription.id}
                    className="p-4 rounded-md shadow border border-[var(--accent-color)]/30 bg-card"
                  >
                    <p className="font-semibold">
                      <span className="text-indigo-600 font-bold">Patient:</span>{" "}
                      {prescription.patient?.name || "Unknown"}
                      <span className="text-gray-600 text-sm"> (ID: {prescription.patientId})</span>
                    </p>
                    <div className="mt-2">
                      <p><strong>Medicine:</strong> {prescription.name}</p>
                      <p><strong>Dosage:</strong> {prescription.dosage}</p>
                    </div>
                    <p className="mt-2">
                      <strong>Status:</strong> {prescription.status}
                    </p>
                    <p className="text-gray-600 text-sm">
                      <strong>Created At:</strong>{" "}
                      {new Date(prescription.createdAt).toLocaleString()}
                    </p>

                    {prescription.status === "pending" ? (
                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={() => handleApprove(prescription.id)}
                          className="px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(prescription.id)}
                          className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled
                        className="mt-3 px-4 py-2 bg-gray-400 text-white font-semibold rounded cursor-not-allowed"
                      >
                        {prescription.status.charAt(0).toUpperCase() +
                          prescription.status.slice(1)}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No prescriptions available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
