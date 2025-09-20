"use client";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listTransactionsByCampaign } from "@/lib/blockchain";

export default function CampaignDetailsPage() {
  const params = useParams<{ id: string }>();
  const { state, endCampaign, donate, withdraw, deleteCampaign } = useStore();
  const router = useRouter();
  const camp = state.campaigns.find((c) => c.id === params.id);
  const [message, setMessage] = useState("");
  const [openDonate, setOpenDonate] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [donation, setDonation] = useState<string>("");
  const [withdrawAmt, setWithdrawAmt] = useState<string>("");
  const [loadingDonate, setLoadingDonate] = useState(false);
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const [txRows, setTxRows] = useState<Array<{ owner: string; amount: number; timestamp: number; credited: boolean }>>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  // Always call hooks in the same order; guard logic inside.
  useEffect(() => {
    (async () => {
      if (!camp) return;
      try {
        setLoadingTx(true);
        const r = await listTransactionsByCampaign(BigInt(camp.id));
        setTxRows(r);
      } finally {
        setLoadingTx(false);
      }
    })();
  }, [camp?.id]);
  if (!camp) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Campaign not found</h1>
        <p className="text-muted-foreground">The campaign may have been deleted or the link is incorrect.</p>
        <Button variant="outline" onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }
  const total = (camp.totalDonated ?? camp.amountRaised);
  const pct = Math.min(100, Math.floor((total / Math.max(1, camp.targetAmount)) * 100));
  const isCompleted = camp.status === "completed";
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-0">
        {camp.imageUrl && (
          <div className="relative w-full aspect-video overflow-hidden">
            <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover" />
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
        )}
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{camp.title}</h1>
              <p className="text-muted-foreground mt-2">{camp.description}</p>
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

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-lg">{format(total, state.settings.currencySymbol)}</span>
              <span className="text-muted-foreground font-medium">of {format(camp.targetAmount, state.settings.currencySymbol)}</span>
            </div>
            <Progress value={pct} className="h-2" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">{pct}% funded</span>
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                {camp.donorsCount ?? 0} backers
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Balance: {format(camp.amountRaised, state.settings.currencySymbol)} • Total Donated: {format(total, state.settings.currencySymbol)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">Owner</div>
              <div className="font-medium break-all">{camp.owner ?? "Unknown"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Created</div>
              <div className="font-medium">{new Date(camp.createdAt).toLocaleString()}</div>
            </div>
            {camp.deadline && (
              <div className="space-y-1">
                <div className="text-muted-foreground">Deadline</div>
                <div className="font-medium flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(camp.deadline).toLocaleDateString()}</div>
              </div>
            )}
          </div>

          <div className="flex w-full flex-wrap gap-2">
            {/* Donate dialog */}
            <Dialog open={openDonate} onOpenChange={setOpenDonate}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={isCompleted || loadingDonate} className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 disabled:opacity-60">
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
                  <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                    Help reach the goal of <span className="font-semibold text-foreground">{format(camp.targetAmount, state.settings.currencySymbol)}</span>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="amount" className="text-sm font-medium">Amount ({state.settings.currencySymbol})</Label>
                    <Input id="amount" type="number" min={state.settings.minDonation} step="0.1" placeholder={`${state.settings.minDonation}`} value={donation} onChange={(e) => setDonation(e.currentTarget.value)} disabled={loadingDonate} className="text-lg font-semibold" />
                    <div className="text-xs text-muted-foreground">Minimum {state.settings.minDonation} {state.settings.currencySymbol}</div>
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
                    {loadingDonate ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</span> : "Confirm Donation"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Withdraw dialog */}
            <Dialog open={openWithdraw} onOpenChange={setOpenWithdraw}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={isCompleted || loadingWithdraw} className="border-dashed hover:border-solid disabled:opacity-60">
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
                  <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                    Current balance: <span className="font-semibold text-foreground">{format(camp.amountRaised, state.settings.currencySymbol)}</span>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="withdraw" className="text-sm font-medium">Amount ({state.settings.currencySymbol})</Label>
                    <Input id="withdraw" type="number" min={state.settings.minDonation} step="0.1" value={withdrawAmt} onChange={(e) => setWithdrawAmt(e.currentTarget.value)} disabled={loadingWithdraw} className="text-lg font-semibold" />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-gradient-to-r from-primary to-primary/90" disabled={loadingWithdraw || isCompleted} onClick={async () => {
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
                    }}>
                      {loadingWithdraw ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</span> : "Withdraw All"}
                    </Button>
                    <Button variant="outline" className="flex-1" disabled={loadingWithdraw || isCompleted} onClick={async () => {
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
                    }}>
                      {loadingWithdraw ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</span> : "Withdraw Amount"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Delete Campaign */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="border-0 text-destructive hover:bg-destructive/10">Delete</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete campaign?</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm text-muted-foreground">
                  This action cannot be undone. This will permanently delete the campaign "{camp.title}" and all associated data.
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => (document.activeElement as HTMLElement)?.blur()}>Cancel</Button>
                    <Button className="bg-destructive hover:bg-destructive/90" onClick={async () => {
                      try {
                        await deleteCampaign(camp.id);
                        toast.success("Campaign deleted successfully.");
                        router.push("/");
                      } catch (e: any) {
                        toast.error(e?.message ?? "Failed to delete campaign");
                      }
                    }}>Delete Campaign</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Transactions table */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Transactions</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingTx ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell>
                  </TableRow>
                ) : txRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No transactions yet</TableCell>
                  </TableRow>
                ) : (
                  txRows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className={r.credited ? "text-green-600" : "text-amber-600"}>
                        <span className="inline-flex items-center gap-1">
                          {r.credited ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />} {r.credited ? "Donation" : "Withdrawal"}
                        </span>
                      </TableCell>
                      <TableCell>{r.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} SOL</TableCell>
                      <TableCell className="font-mono text-xs break-all">{r.owner}</TableCell>
                      <TableCell>{new Date(r.timestamp * 1000).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function format(n: number, symbol: string) {
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${symbol}`;
}
