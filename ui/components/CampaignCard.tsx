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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Edit, Trash2, Calendar, TrendingUp, Users, Loader2 } from "lucide-react";

function format(n: number, symbol: string) {
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${symbol}`;
}

export function CampaignCard({ id }: { id: string }) {
  const { state, deleteCampaign, donate, withdraw } = useStore();
  const camp = state.campaigns.find((c) => c.id === id);
  const [loadingDonate, setLoadingDonate] = useState(false);
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const [openDonate, setOpenDonate] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [donation, setDonation] = useState<string>("");
  const [withdrawAmt, setWithdrawAmt] = useState<string>("");
  if (!camp) return null;
  const total = camp.totalDonated ?? camp.amountRaised;
  const pct = Math.min(100, Math.floor((total / Math.max(1, camp.targetAmount)) * 100));
  const isCompleted = camp.status === "completed";

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
      <Link href={`/campaigns/${camp.id}`} className="block" aria-label={`View ${camp.title}`}>
      <div className="mb-5">
        {camp.imageUrl ? (
          <div className="relative aspect-video overflow-hidden">
            <img 
              src={camp.imageUrl} 
              alt={camp.title} 
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute top-3 right-3">
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                camp.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
              }`}>
                {camp.status === 'active' ? '🟢 Active' : '⚪ Completed'}
              </span>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        </div>
        
        <CardHeader className="pb-3">
          <CardTitle className="line-clamp-2 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
            {camp.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm leading-relaxed">
            {camp.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-lg">{format(total, state.settings.currencySymbol)}</span>
              <span className="text-muted-foreground font-medium">of {format(camp.targetAmount, state.settings.currencySymbol)}</span>
            </div>
            <div className="space-y-2">
              <Progress value={pct} className="h-2" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">{pct}% funded</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {camp.donorsCount ?? 0} backers
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Balance: {format(camp.amountRaised, state.settings.currencySymbol)} • Total Donated: {format(total, state.settings.currencySymbol)}
            </div>
          </div>
          
          {camp.deadline && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Deadline: {new Date(camp.deadline).toLocaleDateString()}
            </div>
          )}
          
          {camp.status !== "active" && (camp as any).completionMessage && (
            <div className="rounded-lg bg-muted/50 p-3 text-xs italic text-muted-foreground border border-border/50">
              {(camp as any).completionMessage}
            </div>
          )}
        </CardContent>
      </Link>
      <CardFooter className="border-t bg-muted/20 p-4">
        <div className="flex w-full flex-wrap gap-2">
          <Dialog open={openDonate} onOpenChange={setOpenDonate}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={isCompleted || loadingDonate} className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                Donate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Donate to {camp.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="text-sm text-muted-foreground">
                    Support this campaign and help reach the goal of{' '}
                    <span className="font-semibold text-foreground">
                      {format(camp.targetAmount, state.settings.currencySymbol)}
                    </span>
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="amount" className="text-sm font-medium">
                    Amount ({state.settings.currencySymbol})
                  </Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    min={state.settings.minDonation} 
                    step="0.1"
                    placeholder={`${state.settings.minDonation}`}
                    value={donation}
                    onChange={(e) => setDonation(e.currentTarget.value)}
                    disabled={loadingDonate}
                    className="text-lg font-semibold"
                  />
                  <div className="text-xs text-muted-foreground">
                    Minimum {state.settings.minDonation} {state.settings.currencySymbol}
                  </div>
                </div>
                <Button
                  disabled={loadingDonate || isCompleted}
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
                      setOpenDonate(false);
                    } catch (e: any) {
                      toast.error(e?.message ?? "Failed to donate");
                    } finally {
                      setLoadingDonate(false);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
                >
                  {loadingDonate ? (
                    <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</span>
                  ) : (
                    "Confirm Donation"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={openWithdraw} onOpenChange={setOpenWithdraw}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" disabled={isCompleted || loadingWithdraw} className="border-dashed hover:border-solid transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Withdraw from {camp.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="text-sm text-muted-foreground">
                    Current balance:{' '}
                    <span className="font-semibold text-foreground">
                      {format(camp.amountRaised, state.settings.currencySymbol)}
                    </span>
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="withdraw" className="text-sm font-medium">
                    Amount ({state.settings.currencySymbol})
                  </Label>
                  <Input
                    id="withdraw"
                    type="number"
                    min={state.settings.minDonation}
                    step="0.1"
                    value={withdrawAmt}
                    onChange={(e) => setWithdrawAmt(e.currentTarget.value)}
                    disabled={loadingWithdraw}
                    className="text-lg font-semibold"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-primary to-primary/90" 
                    disabled={loadingWithdraw || isCompleted} 
                    onClick={async () => {
                      const min = state.settings.minDonation ?? 0.1;
                      if ((camp.amountRaised ?? 0) < min) {
                        toast.error(`Balance is below minimum ${min} ${state.settings.currencySymbol}.`);
                        return;
                      }
                      try {
                        setLoadingWithdraw(true);
                        await withdraw(camp.id);
                        toast.success("Withdrawal requested.");
                        setOpenWithdraw(false);
                      } catch (e: any) {
                        toast.error(e?.message ?? "Failed to withdraw");
                      } finally {
                        setLoadingWithdraw(false);
                      }
                    }}
                  >
                    {loadingWithdraw ? (
                      <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</span>
                    ) : (
                      "Withdraw All"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={loadingWithdraw || isCompleted}
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
                        setOpenWithdraw(false);
                      } catch (e: any) {
                        toast.error(e?.message ?? "Failed to withdraw");
                      } finally {
                        setLoadingWithdraw(false);
                      }
                    }}
                  >
                    {loadingWithdraw ? (
                      <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</span>
                    ) : (
                      "Withdraw Amount"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {isCompleted ? (
            <Button size="sm" variant="ghost" disabled className="hover:bg-primary/10 hover:text-primary disabled:opacity-60 disabled:cursor-not-allowed">
              <Edit className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          ) : (
            <Button asChild size="sm" variant="ghost" className="hover:bg-primary/10 hover:text-primary">
              <Link href={`/campaigns/${camp.id}/edit`} className="flex items-center gap-2">
                <Edit className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" disabled={isCompleted} className="hover:bg-destructive/10 hover:text-destructive disabled:opacity-60 disabled:cursor-not-allowed">
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline ml-2">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  Delete campaign?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the campaign "{camp.title}" and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={async () => {
                    try {
                      await deleteCampaign(camp.id);
                      toast.success("Campaign deleted successfully.");
                    } catch (e: any) {
                      toast.error(e?.message ?? "Failed to delete campaign");
                    }
                  }}
                >
                  Delete Campaign
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
