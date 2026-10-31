import { NextResponse } from "next/server";
import crypto from "node:crypto";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const header = req.headers.get("mux-signature") ?? "";
    const provided = header
      .split(",")
      .map((part) => part.trim())
      .find((part) => part.startsWith("v1="))
      ?.replace(/^v1=/, "");

    const expected = crypto
      .createHmac("sha256", process.env.MUX_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("base64");

    if (!provided) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isValid = crypto.timingSafeEqual(
      Buffer.from(provided),
      Buffer.from(expected)
    );

    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    if (body.type !== "video.asset.ready") {
      return NextResponse.json({ ok: true });
    }

    const asset = body.data;
    const playbackId = asset.playback_ids?.[0]?.id;
    const muxAssetId = asset.id;
    const userId = asset.passthrough;

    if (!userId || !playbackId) {
      return NextResponse.json({ ok: true });
    }

    await prisma.video.upsert({
      where: { muxAssetId },
      update: { playbackId, userId },
      create: { muxAssetId, playbackId, userId },
    });

    return NextResponse.json({ message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook failed:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
