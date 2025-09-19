"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function format(n: number, symbol: string) {
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${symbol}`;
}

export function CampaignCard({ id }: { id: string }) {
  const { state, deleteCampaign, donate, withdraw } = useStore();
  const camp = state.campaigns.find((c) => c.id === id);
  const [donation, setDonation] = useState<string>("");
  const [withdrawAmt, setWithdrawAmt] = useState<string>("");
  if (!camp) return null;
  const pct = Math.min(100, Math.floor((camp.amountRaised / Math.max(1, camp.targetAmount)) * 100));
  const [loadingDonate, setLoadingDonate] = useState(false);
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);

  return (
    <Card className="overflow-hidden">
      {camp.imageUrl ? (
        <div className="relative w-full h-40 overflow-hidden">
          <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-16 bg-muted" />
      )}
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span className="truncate">{camp.title}</span>
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-secondary text-secondary-foreground capitalize">
            {camp.status}
          </span>
        </CardTitle>
        <CardDescription className="line-clamp-3">{camp.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{format(camp.amountRaised, state.settings.currencySymbol)}</span>
          <span className="text-muted-foreground">of {format(camp.targetAmount, state.settings.currencySymbol)}</span>
        </div>
        <div className="space-y-1">
          <Progress value={pct} />
          <div className="text-[11px] text-muted-foreground">{pct}% funded</div>
        </div>
        {camp.deadline ? (
          <div className="text-xs text-muted-foreground">Deadline: {new Date(camp.deadline).toLocaleDateString()}</div>
        ) : null}
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">Donate</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Donate to {camp.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount ({state.settings.currencySymbol})</Label>
                <Input id="amount" type="number" min={state.settings.minDonation} step="0.1"
                  placeholder={`${state.settings.minDonation}`}
                  value={donation}
                  onChange={(e) => setDonation(e.currentTarget.value)}
                />
                <div className="text-xs text-muted-foreground">
                  Minimum {state.settings.minDonation} {state.settings.currencySymbol}
                </div>
              </div>
              <Button
                disabled={loadingDonate}
                onClick={async () => {
                  const amt = parseFloat(donation);
                  if (isNaN(amt) || amt < (state.settings.minDonation ?? 0.1)) {
                    toast.error(`Please enter at least ${state.settings.minDonation} ${state.settings.currencySymbol}.`);
                    return;
                  }
                  try {
                    setLoadingDonate(true);
                    await donate(camp.id, amt);
                    toast.success("Donation sent. Check wallet for confirmation.");
                    setDonation("");
                  } catch (e: any) {
                    toast.error(e?.message ?? "Failed to donate");
                  } finally {
                    setLoadingDonate(false);
                  }
                }}
              >{loadingDonate ? "Processing..." : "Confirm Donation"}</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary">Withdraw</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw from {camp.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Current balance: {format(camp.amountRaised, state.settings.currencySymbol)}</div>
              <div className="grid gap-2">
                <Label htmlFor="withdraw">Amount ({state.settings.currencySymbol})</Label>
                <Input
                  id="withdraw"
                  type="number"
                  min={state.settings.minDonation}
                  step="0.1"
                  value={withdrawAmt}
                  onChange={(e) => setWithdrawAmt(e.currentTarget.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button disabled={loadingWithdraw} onClick={async () => {
                  try {
                    setLoadingWithdraw(true);
                    await withdraw(camp.id);
                    toast.success("Withdrawal requested.");
                  } catch (e: any) {
                    toast.error(e?.message ?? "Failed to withdraw");
                  } finally {
                    setLoadingWithdraw(false);
                  }
                }}>Withdraw All</Button>
                <Button
                  variant="secondary"
                  disabled={loadingWithdraw}
                  onClick={async () => {
                    const amt = parseFloat(withdrawAmt);
                    if (isNaN(amt) || amt < (state.settings.minDonation ?? 0.1)) {
                      toast.error(`Please enter at least ${state.settings.minDonation} ${state.settings.currencySymbol}.`);
                      return;
                    }
                    try {
                      setLoadingWithdraw(true);
                      await withdraw(camp.id, amt);
                      toast.success("Withdrawal requested.");
                      setWithdrawAmt("");
                    } catch (e: any) {
                      toast.error(e?.message ?? "Failed to withdraw");
                    } finally {
                      setLoadingWithdraw(false);
                    }
                  }}
                >{loadingWithdraw ? "Processing..." : "Withdraw Amount"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button asChild size="sm" variant="outline">
          <Link href={`/campaigns/${camp.id}/edit`}>Edit</Link>
        </Button>

        <Button size="sm" variant="destructive" onClick={async () => {
          if (!confirm("Delete this campaign? This cannot be undone.")) return;
          try {
            await deleteCampaign(camp.id);
            toast.success("Campaign deleted.");
          } catch (e: any) {
            toast.error(e?.message ?? "Failed to delete campaign");
          }
        }}>Delete</Button>

        <div className="ml-auto">
          <Button asChild size="sm" variant="ghost">
            <Link href={`/campaigns/${camp.id}`}>View</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
