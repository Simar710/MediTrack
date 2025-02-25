"use client";
import "./globals.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "../utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setUser(response.data); // Store user profile data (includes role)
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    router.push("/");
  };

  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="p-4 flex justify-between bg-gray-900 text-white">
          <Link href="/" className="text-xl font-semibold hover:underline">MediTrack</Link>
          
          <div className="space-x-6">
            {user ? (
              <>
                <span className="font-medium">
                  {user.name} ({user.role})
                </span>
                <button 
                  onClick={handleLogout} 
                  className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:underline">Login</Link>
                <Link href="/signup" className="hover:underline">Sign Up</Link>
              </>
            )}
          </div>
        </header>

        {/* Show Back Button If Not on Home Page */}
        {pathname !== "/" && (
          <div className="p-4">
            <Link href="/" className="text-lg font-semibold text-white hover:underline">
              ← Home
            </Link>
          </div>
        )}

        <main>{children}</main>
      </body>
    </html>
  );
}
