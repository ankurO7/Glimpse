import { LayoutGrid, Video } from "lucide-react";
import  Link  from "next/link";
import Image from "next/image";
import ScreenRecorder from "@/components/ScreenRecorder";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative">

      {/* Navigation to Dashboard */}
      <div>
        <Link 
          href='/dashboard'
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover: bg-slate-800 border border-slate-800
          hover:border-slate-700 text-slate-300 rounded-2xl">
            <LayoutGrid className="w-4  h-4 group-hover:text-white transition" />
            <span className="hidden sm:inline">My Recordings</span>
        </Link>
      </div>

      <div className="z-10 w-full max-w-2xl flex flex-col items-center gap-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-tr from-blue-600 to-emerald-500 shadow-lg shadow-blue">
            <Video className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            BLoom
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Mux + AI Transcripts
          </p>

        </div>

        {/* Screen Recorder  */}
        <ScreenRecorder />

      </div>

    </main>
  );
}
