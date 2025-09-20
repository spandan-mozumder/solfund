"use client";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { CampaignCard } from "@/components/CampaignCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CampaignDetailsPage() {
  const params = useParams<{ id: string }>();
  const { state, endCampaign } = useStore();
  const router = useRouter();
  const camp = state.campaigns.find((c) => c.id === params.id);
  const [message, setMessage] = useState("");
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
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link href={`/campaigns/${camp.id}/edit`}>Edit</Link></Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">End Campaign</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>End campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="end-msg">Completion message</Label>
                  <Input id="end-msg" value={message} onChange={(e) => setMessage(e.currentTarget.value)} placeholder="e.g. Goal achieved. Thank you!" />
                </div>
                <Button onClick={async () => {
                  try {
                    await endCampaign(camp.id, message || "Campaign ended");
                    toast.success("Campaign ended.");
                    setMessage("");
                  } catch (e: any) {
                    toast.error(e?.message ?? "Failed to end campaign");
                  }
                }}>Withdraw All & Complete</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <CampaignCard id={camp.id} />
    </div>
  );
}
