"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { CampaignCard } from "@/components/CampaignCard";

export default function Home() {
  const { state } = useStore();
  const ids = state.campaigns.map((c) => c.id);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
          <p className="text-sm text-muted-foreground">Create, fund, and manage campaigns on Solana.</p>
        </div>
        <Button asChild>
          <Link href="/campaigns/new">Create Campaign</Link>
        </Button>
      </div>
      {ids.length === 0 ? (
        <div className="text-center border rounded-lg py-16 bg-muted/30">
          <h2 className="text-base font-medium">No campaigns yet</h2>
          <p className="text-sm text-muted-foreground mt-1">Get started by creating your first campaign.</p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/campaigns/new">Create your first campaign</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ids.map((id) => (
            <CampaignCard key={id} id={id} />
          ))}
        </div>
      )}
    </div>
  );
}
