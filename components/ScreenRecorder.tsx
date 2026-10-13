"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Monitor, StopCircle, Video } from "lucide-react";
import { createUploadUrl, getAssetIdFromUpload } from "@/app/actions";

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);

  const router = useRouter();

  const stopAllStreams = () => {
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;
    micStreamRef.current = null;
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startRecording = async () => {
    try {
      setError(null);

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
        video: false,
      });

      screenStreamRef.current = screenStream;
      micStreamRef.current = micStream;

      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...micStream.getAudioTracks(),
      ]);

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = combinedStream;
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const mediaRecorder = new MediaRecorder(combinedStream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setMediaBlob(blob);

        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = null;
        }

        stopAllStreams();
      };

      mediaRecorder.start();
      setIsRecording(true);

      if (screenStream.getVideoTracks()[0]) {
        screenStream.getVideoTracks()[0].onended = () => stopRecording();
      }
    } catch (err) {
      console.error("Error starting recording:", err);
      stopAllStreams();
      setError("Screen sharing could not start. Check your browser permissions and try again.");
    }
  };

  const handleUpload = async () => {
    if (!mediaBlob) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploadConfig = await createUploadUrl();

      const uploadResponse = await fetch(uploadConfig.url, {
        method: "PUT",
        body: mediaBlob,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status ${uploadResponse.status}.`);
      }

      for (let attempt = 0; attempt < 90; attempt += 1) {
        const result = await getAssetIdFromUpload(uploadConfig.id);

        if (result.playbackId) {
          router.push(`/video/${result.playbackId}`);
          return;
        }

        if (result.status === "errored") {
          throw new Error(result.error ?? "Mux could not process this recording.");
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      throw new Error("Processing is taking longer than expected. Please try uploading again.");
    } catch (e) {
      console.error("Error uploading video", e);
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-5 sm:p-8 bg-slate-900/90 rounded-2xl border border-slate-700/80 w-full max-w-md shadow-2xl shadow-black/30">
      <h2 className="text-2xl font-bold text-white">
        {isRecording ? "Recording..." : "New Recording"}
      </h2>

      <div className="w-full aspect-video bg-black rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden">
        <video
          ref={liveVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isRecording ? "block" : "hidden"}`}
        />

        {!isRecording && mediaBlob && (
          <div className="text-emerald-400 flex flex-col items-center gap-1">
            <Video className="w-12 h-12 mb-2" />
            <span className="font-medium">Recording ready to share</span>
          </div>
        )}

        {!isRecording && !mediaBlob && (
          <div className="text-slate-600 flex flex-col items-center">
            <Monitor className="w-12 h-12 mb-2 opacity-50" />
            <span className="text-sm">Your preview will appear here</span>
          </div>
        )}

        {isRecording && (
          <div className="absolute top-4 right-4 animate-pulse">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="w-full rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </div>
      )}

      <div className="flex w-full gap-4">
        {!isRecording && !mediaBlob && (
          <button
            onClick={startRecording}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex justify-center items-center gap-2"
          >
            <StopCircle className="w-5 h-5" /> Stop Recording
          </button>
        )}

        {mediaBlob && (
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium flex justify-center items-center gap-2 disabled:cursor-wait disabled:opacity-70"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" /> Uploading...
              </>
            ) : (
              "Upload & Share"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
