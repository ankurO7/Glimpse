import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();


        if (body.type === 'video.asset.ready') {
        const asset = body.data;
        const playbackId = asset.playback_ids[0].id;
        const muxAssetId = asset.id;
        const userId = asset.passthrough;

        if (userId) {
        await prisma.video.create({
        data: {
        muxAssetId: muxAssetId,
        playbackId: playbackId,
        userId: userId,
        }
        });
        console.log("Video saved for user:", userId);
        }
        }

        return NextResponse.json({ message: "Webhook processed" });
    } catch (error) {
        console.error("Webhook crashed:", error);
        return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
    }
}