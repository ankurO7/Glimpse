'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAssetStatus } from "@/app/actions";
import { Loader2 } from "lucide-react";

export default function VideoStatusPoller({
    id,
    isVideoReady,
    status
}: {
    id:string;
    isVideoReady:boolean;
    status?: string;
}) {
    const router = useRouter();

    useEffect(() => {
        const CheckStatus = async () => {
            const {status, transcriptStatus } = await getAssetStatus(id);

            if(!isVideoReady && status === 'ready'){
                router.refresh();
            }

            if(!isVideoReady && transcriptStatus === 'ready'){
                router.refresh();
            }

            if (!isVideoReady && status === 'errored') {
                return;
            }
        };

        if (status === 'errored') return;

        CheckStatus();
        const interval = setInterval(CheckStatus, 3000);
        return () => clearInterval(interval);

    }, [id, isVideoReady, router, status]);

    if(isVideoReady) return null;

    if (status === 'errored') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-red-950/30 px-6 text-center">
                <p className="font-semibold text-red-200">This recording could not be processed.</p>
                <p className="text-sm text-red-200/70">Return to the recorder and upload it again.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-900">
            <Loader2 className="w-8 h-8 mb-4 animate-spin text-blue-500" />
            <p>Processing Video...</p>
        </div>
    );
}
