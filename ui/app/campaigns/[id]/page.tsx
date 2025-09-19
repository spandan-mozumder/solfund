"use client";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { CampaignCard } from "@/components/CampaignCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CampaignDetailsPage() {
  const params = useParams<{ id: string }>();
  const { state } = useStore();
  const router = useRouter();
  const camp = state.campaigns.find((c) => c.id === params.id);
  if (!camp) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Campaign not found</h1>
        <p className="text-muted-foreground">The campaign may have been deleted or the link is incorrect.</p>
        <Button variant="outline" onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{camp.title}</h1>
          <p className="text-sm text-muted-foreground">Manage donations, withdraw funds, or edit details.</p>
        </div>
        <Button asChild variant="outline"><Link href={`/campaigns/${camp.id}/edit`}>Edit</Link></Button>
      </div>
      <CampaignCard id={camp.id} />
    </div>
  );
}
