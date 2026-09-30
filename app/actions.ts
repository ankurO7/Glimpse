'use server';

import prisma from "@/lib/prisma";
import Mux from "@mux/mux-node";
import { Playback } from "@mux/mux-node/resources/video.mjs";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export async function createUploadUrl(){

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        throw new Error('You must be signed in to upload a recording.');
    }

    const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email}
    });
    if (!currentUser) {
        throw new Error('Your account could not be found. Please sign in again.');
    }

    const upload = await mux.video.uploads.create({
        new_asset_settings: {
            playback_policies: ['public'],
            video_quality: 'basic',
            passthrough: currentUser.id,
            static_renditions: [{ resolution: '480p' }],
            inputs: [
                {
                    generated_subtitles: [
                        { language_code: 'en', name: 'English (Auto)'}
                    ]
                },
                // {
                //     url: '',
                //     overlay_settings: {
                //         vertical_align: 'top',
                //         vertical_margin: '20px',
                //         horizontal_align: 'right',
                //         horizontal_margin: '20px',
                //         width: '150px',
                //         opacity: '80%'

                //     }
                // }
            ]
        },
        cors_origin: '*',
    });
    return {
        id: upload.id,
        url: upload.url
    };
}

export async function getAssetIdFromUpload(uploadId: string) {
  try {
    const upload = await mux.video.uploads.retrieve(uploadId);

    if (upload.status === "errored") {
      return { status: "errored", error: "Mux could not process this upload." };
    }

    if (upload.asset_id) {
      const asset = await mux.video.assets.retrieve(upload.asset_id);

      if (asset.status === "errored") {
        return { status: "errored", error: "Mux could not process this recording." };
      }

      const playbackId = asset.playback_ids?.[0]?.id;

      if (playbackId) {
        return {
          playbackId,
          status: asset.status,
        };
      }
    }

    return { status: upload.status ?? "waiting" };
  } catch (error) {
    console.error("Error checking upload status", error);
    return { status: "errored", error: "Could not check the upload status." };
  }
}

export async function ListVideos() {

    try {
        const session = await getServerSession(authOptions);
    
        if(!session?.user?.email){
            return [];
        }
        const currentUser = await prisma.user.findUnique({
            where: { email: session?.user?.email}
        });
    
        if(!currentUser) return [];
    
        const userVideos = await prisma.video.findMany({
                where: {
                    userId: currentUser.id, 
                },
                orderBy: {
                    createdAt: 'desc', 
                }
            });
    
        return userVideos;
        
    } catch(e){
        console.error("Error listing videos",e);
        return [];
    }
}

function formatVttTime(timestamp: string){
    return timestamp.split('.')[0];
}

export async function getAssetStatus(playbackId: string){

    try {
        const assets = await mux.video.assets.list({ limit: 100});
        const asset  = assets.data.find( a => 
            a.playback_ids?.some(p => p.id === playbackId)
        );

        if(!asset) return { status : 'errored', transcript: []};

        let transcript: { time: string; text: string } [] = [];
        let transcriptStatus = 'preparing';

        if(asset.status === 'ready' && asset.tracks){

            const textTrack = asset.tracks.find(
                t => t.type === 'text' && t.text_type === 'subtitles'
            );

            if(textTrack && textTrack.status === 'ready'){

                transcriptStatus = 'ready';

                const vttUrl = `https://stream.mux.com/${playbackId}/text/${textTrack.id}.vtt`;
                const response = await fetch(vttUrl);

                const vttText = await response.text();

                const blocks = vttText.split('\n\n');

                transcript = blocks.reduce(( acc: { time: string; text: string }[],block) => {
                    const lines = block.split('\n');
                    
                    if(lines.length >= 2 && lines[1].includes('-->')){
                        const time = formatVttTime(lines[1].split('-->')[0]);
                        const text = lines.slice(2).join(' ');
                        if(text.trim()) acc.push({ time,text});
                    }
                    return acc;

                }, []);
            }
        }
        return { 
            status: asset.status,
            transcriptStatus,
            transcript
        };
    } catch(e) {
        return { status: 'errored', transcriptStatus: 'errored', transcript: []};
    }
}

export async function generateVideoSummary(playbackId: string) {
    try{
        const assets = await mux.video.assets.list({ limit: 100 });
        const asset = assets.data.find(a =>
            a.playback_ids?.some(p => p.id === playbackId)
        );

        if(!asset) {
            throw new Error('Asset not found');
        }

        const { getSummaryAndTags } = await import('@mux/ai/workflows');

        const result = await getSummaryAndTags(asset.id, {
            provider: 'google',
            tone: 'professional',
        });

        return {
            title: result.title,
            summary: result.description,
            tags: result.tags,
        };
    } catch (error) {
        console.error('Error generating summary: ',error);
        return null;
    }
}
