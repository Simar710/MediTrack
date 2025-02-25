// app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../utils/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      alert("Login Failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-r from-[#2e3a46] to-[#46555e]">
      <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-indigo-600">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
