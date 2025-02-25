// app/profile/page.tsx
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(response.data);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4 text-center">Your Profile</h2>
        {profile ? (
          <div className="text-lg">
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role:</strong> {profile.role}</p>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
    </div>
  );
}
