import { SettingsForm } from "@/components/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Platform Settings</h1>
      <SettingsForm />
    </div>
  );
}
