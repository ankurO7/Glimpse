import { getAssetStatus } from "@/app/actions";
import MuxPlayerWrapper from "@/components/MuxPlayerWrapper";
import ShareButton from "@/components/ShareButton";
import VideoStatusPoller from "@/components/VideoStatusPoller";
import { ArrowLeft, Link } from "lucide-react";

export default async function VideoPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const {id : playbackId } = await params;
    const { status, transcriptStatus, transcript } = await getAssetStatus(playbackId);

    const isVideoReady = status === 'ready';
    const isTranscriptReady = transcriptStatus === 'ready';

    const downloadUrl = `https://stream.mux.com/${playbackId}/high.mp4?download=screen-recording.mp4`;

    return(
        <main className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-200">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Navigation */}
                <div className="lg:col-span-3 mb-2">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition">
                            <ArrowLeft className="w-4 h-4" />
                            Record New Video
                        </Link>
                </div>

                {/* Left Column: Video Player */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 aspect-video relative">
                        {isVideoReady ? (
                            <>
                                <MuxPlayerWrapper playbackId={playbackId} />
                                {!isTranscriptReady && <VideoStatusPoller id={playbackId} isVideoReady={true} />}
                            </>
                        ) : (
                            <VideoStatusPoller id={playbackId} isVideoReady={false} />
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <h1 className="text-xl font-bold text-white">Screen Recording</h1>
                        <div className="flex gap-3">
                            <ShareButton />
                            {isVideoReady && (
                                <a href={downloadUrl}
                                target="_blank"
                                rel="noopener nonreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg "></a>

                            )}
                        </div>
                    </div>

                </div>
            </div>
        </main>
    )
}