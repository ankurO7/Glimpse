"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  // This hook grabs the active session from the provider
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  // If the user is logged in, show their name and a sign out button
  if (session) {
    return (
      <div className="flex items-center gap-4">
        <p>Signed in as {session.user?.name}</p>
        <button 
          onClick={() => signOut()} 
          className="bg-red-500 text-white px-4 py-2 rounded-md"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // If the user is NOT logged in, show the Google sign in button
  return (
    <button 
      onClick={() => signIn("google")} 
      className="bg-blue-500 hover:bg-blue-800 text-white px-4 py-2 rounded-md"
    >
      Sign In with Google
    </button>
  );
}