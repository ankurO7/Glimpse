'use client';
import { generateVideoSummary } from "@/app/actions";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

interface SummaryData {
    title: string;
    summary: string;
    tags: string[];
}

export default function VideoSummary({ playbackId }: { playbackId: string}) {
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(false);

        const result = await generateVideoSummary(playbackId);

        if(result){
            setSummary(result);
        } else{
            setError(true);
        }

        setIsGenerating(false);
    };

    if(summary){
        return (
            <div>
                <h3>
                    {summary.title}
                </h3>
                <p>
                    {summary.summary}
                </p>
                <div>
                    {summary.tags.map((tag) => (
                        <span key={tag}
                        className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-200">
                {isGenerating ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Video...
                    </>
                ) : error ? (
                    'Try Again'
                ) : (
                    <>
                        <Sparkles className="w-4 h-4" />
                        Generate AI Summary

                    </>
                )}
        </button>
    );
}