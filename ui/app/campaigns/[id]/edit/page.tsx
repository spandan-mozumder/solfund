"use client";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { CampaignForm } from "@/components/CampaignForm";

export default function EditCampaignPage() {
  const params = useParams<{ id: string }>();
  const { state } = useStore();
  const camp = state.campaigns.find((c) => c.id === params.id);
  if (!camp) return <p className="text-muted-foreground">Campaign not found.</p>;
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Edit Campaign</h1>
      <CampaignForm mode="edit" defaultValues={camp} />
    </div>
  );
}
