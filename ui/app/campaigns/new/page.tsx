import { CampaignForm } from "@/components/CampaignForm";

export default function NewCampaignPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Create Campaign</h1>
      <CampaignForm mode="create" />
    </div>
  );
}
