"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { CampaignCard } from "@/components/CampaignCard";
import { ArrowLeft, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CompletedCampaignsPage() {
  const { state } = useStore();
  const completed = state.campaigns.filter((c) => c.status === "completed");
  const ids = completed.map((c) => c.id);
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-7 w-7 text-primary" /> Completed Campaigns
          </h1>
          <p className="text-muted-foreground mt-1">Browse campaigns that have reached completion. Actions are disabled.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {ids.length === 0 ? (
        <Card className="border-2 border-dashed border-muted-foreground/25 bg-gradient-to-br from-muted/30 to-muted/10">
          <CardContent className="text-center py-16 px-6">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
              <Trophy className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No completed campaigns yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Once campaigns are completed, they will appear here.
            </p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {ids.map((id) => (
            <CampaignCard key={id} id={id} />
          ))}
        </div>
      )}
    </div>
  );
}
