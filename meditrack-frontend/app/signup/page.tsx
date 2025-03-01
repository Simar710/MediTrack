// app/signup/page.tsx
"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../utils/firebase";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  
  const handleSignUp = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      const token = await result.user.getIdToken();
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/create-user`,
        { email, name, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push("/dashboard");
    } catch (error) {
      alert("Sign Up Failed. Please check your details.");
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-r from-[#2e3a46] to-[#46555e]">
      <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-indigo-600">Sign Up</h2>
        <input
          type="text"
          placeholder="Name"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="patient">Patient</option>
          <option value="pharmacist">Pharmacist</option>
        </select>
        <button
          onClick={handleSignUp}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded transition"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
