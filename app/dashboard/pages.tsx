import Link from "next/link";
import { ListVideos } from "@/app/actions";
import { ArrowLeft } from "lucide-react";
import VideoThumbnail from "@/components/VideoThumbnail";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const videos = await ListV
}
