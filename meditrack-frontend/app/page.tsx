"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white relative px-4">
      <main className="text-center">
        <h1 className="text-5xl font-extrabold mb-4">Welcome to MediTrack</h1>
        <p className="text-xl mb-8">Manage your prescriptions effortlessly with our secure and modern platform.</p>
        <Link
          href={user ? "/dashboard" : "/login"}
          className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition"
        >
          {user ? "Go to Dashboard" : "Get Started"}
        </Link>
      </main>
    </div>
  );
}
