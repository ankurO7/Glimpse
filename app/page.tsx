import { LayoutGrid, Video } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth"; // Add this
import { authOptions } from "./api/auth/[...nextauth]/route"; // Add this
import ScreenRecorder from "@/components/ScreenRecorder";
import AuthButton from "@/components/AuthButton"; // Our custom button

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative">
      
      {/* Top Navigation - Only show 'My Recordings' if logged in */}
      <div className="absolute top-6 right-6 flex items-center gap-4">
        {session && (
          <Link 
            href='/dashboard'
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-2xl transition"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">My Recordings</span>
          </Link>
        )}
        <AuthButton />
      </div>

      <div className="z-10 w-full max-w-2xl flex flex-col items-center gap-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 shadow-lg shadow-blue-500/20">
            <Video className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Record You
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-light">
            Free Screen Recording App with audio.
            <br />
            Get AI generated transcripts.
          </p>
        </div>

        {/* Conditional Content */}
        {session ? (
          <div className="w-full animate-in fade-in zoom-in duration-500">
            <ScreenRecorder />
          </div>
        ) : (
          <div className="text-center p-12 border border-dashed border-slate-800 rounded-3xl bg-slate-800 hover:text-black ">
            <h2 className="text-xl text-white font-semibold mb-4">Ready to record?</h2>
            <p className="text-slate-400 mb-8 max-w-xs mx-auto">
              Sign in with your Google account to start recording and saving your videos.
            </p>
            <AuthButton />
          </div>
        )}
      </div>
    </main>
  );
}