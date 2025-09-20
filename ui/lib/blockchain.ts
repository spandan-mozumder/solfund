"use client";
import { BN, Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getProgram } from "./anchorClient";
import { campaignPda, programStatePda, toLittleEndianU64 } from "./pdas";

function solToLamports(sol: number) {
  return BigInt(Math.round(sol * 1_000_000_000));
}

function bnToBigInt(bn: any): bigint {
  if (typeof bn === "bigint") return bn;
  if (bn?.toString) return BigInt(bn.toString());
  return BigInt(bn ?? 0);
}

export async function getProgramState(program?: Program) {
  const p = program ?? (await getProgram());
  const provider = p.provider as any;
  const walletPk = provider.wallet.publicKey as PublicKey;
  const statePda = await programStatePda();
  try {
    const data = await (p.account as any).programState.fetch(statePda);
    return { pda: statePda, data } as const;
  } catch (e: any) {
    // Attempt to initialize program state
    await (p as Program).methods
      .initialize()
      .accounts({ programState: statePda, deployer: walletPk, systemProgram: SystemProgram.programId })
      .rpc();
    const data = await (p.account as any).programState.fetch(statePda);
    return { pda: statePda, data } as const;
  }
}

export async function fetchCampaign(program: Program, cid: bigint) {
  const pda = campaignPda(cid);
  const data = await (program.account as any).campaign.fetch(pda);
  return { pda, data } as const;
}

export async function listCampaigns() {
  const program = await getProgram();
  const state = await getProgramState(program);
  const count = bnToBigInt(state.data.campaignCount ?? state.data.campaign_count);
  const results: Array<{ pda: PublicKey; data: any }> = [];
  for (let i = 1n; i <= count; i++) {
    try {
      const c = await fetchCampaign(program, i);
      results.push(c);
    } catch {}
  }
  return { program, state, campaigns: results };
}

export async function rpcCreateCampaign(args: { title: string; description: string; imageUrl: string; goalSol: number; }) {
  const program = await getProgram();
  const provider = program.provider as any;
  const walletPk = provider.wallet.publicKey as PublicKey;
  const { pda: statePda, data: state } = await getProgramState(program);
  const nextCid = (bnToBigInt(state.campaignCount ?? state.campaign_count) + 1n);
  const nextCampaign = campaignPda(nextCid);
  const goal = new BN(solToLamports(args.goalSol).toString());
  const txSig = await (program as Program).methods
    .createCampaign(args.title, args.description, args.imageUrl, goal)
    .accounts({ programState: statePda, campaign: nextCampaign, creator: walletPk, systemProgram: SystemProgram.programId })
    .rpc();
  return { txSig, cid: nextCid };
}

export async function rpcUpdateCampaign(cid: bigint, args: { title: string; description: string; imageUrl: string; goalSol: number; }) {
  const program = await getProgram();
  const provider = program.provider as any;
  const walletPk = provider.wallet.publicKey as PublicKey;
  const campaign = campaignPda(cid);
  const goal = new BN(solToLamports(args.goalSol).toString());
  return await (program as Program).methods
    .updateCampaign(new BN(cid.toString()), args.title, args.description, args.imageUrl, goal)
    .accounts({ campaign, creator: walletPk, systemProgram: SystemProgram.programId })
    .rpc();
}

export async function rpcDeleteCampaign(cid: bigint) {
  const program = await getProgram();
  const provider = program.provider as any;
  const walletPk = provider.wallet.publicKey as PublicKey;
  const campaign = campaignPda(cid);
  return await (program as Program).methods
    .deleteCampaign(new BN(cid.toString()))
    .accounts({ campaign, creator: walletPk, systemProgram: SystemProgram.programId })
    .rpc();
}

export async function rpcDonate(cid: bigint, amountSol: number) {
  const program = await getProgram();
  const provider = program.provider as any;
  const walletPk = provider.wallet.publicKey as PublicKey;
  const { pda: campaign, data } = await fetchCampaign(program, cid);
  const donors = BigInt(data.donors);
  const txSeed = PublicKey.findProgramAddressSync(
    [Buffer.from("donor"), walletPk.toBuffer(), toLittleEndianU64(cid), toLittleEndianU64(donors + 1n)],
    program.programId
  )[0];
  const amount = new BN(solToLamports(amountSol).toString());
  return await (program as Program).methods
    .donate(new BN(cid.toString()), amount)
    .accounts({ campaign, transaction: txSeed, donor: walletPk, systemProgram: SystemProgram.programId })
    .rpc();
}

export async function rpcWithdraw(cid: bigint, amountSol: number) {
  const program = await getProgram();
  const provider = program.provider as any;
  const walletPk = provider.wallet.publicKey as PublicKey;
  const { pda: campaign, data } = await fetchCampaign(program, cid);
  const withdrawals = BigInt(data.withdrawals);
  const txSeed = PublicKey.findProgramAddressSync(
    [Buffer.from("withdraw"), walletPk.toBuffer(), toLittleEndianU64(cid), toLittleEndianU64(withdrawals + 1n)],
    program.programId
  )[0];
  const { pda: programState, data: state } = await getProgramState(program);
  const platformAddress = new PublicKey(state.platformAddress ?? state.platform_address);
  const amount = new BN(solToLamports(amountSol).toString());
  return await (program as Program).methods
    .withdraw(new BN(cid.toString()), amount)
    .accounts({ campaign, transaction: txSeed, programState, platformAddress, creator: walletPk, systemProgram: SystemProgram.programId })
    .rpc();
}

export function fromLamports(lamports: bigint) {
  const n = Number(lamports) / 1_000_000_000;
  return n;
}

export async function rpcUpdatePlatformFee(newPercent: number) {
  const program = await getProgram();
  const provider = program.provider as any;
  const walletPk = provider.wallet.publicKey as PublicKey;
  const { pda: programState } = await getProgramState(program);
  return await (program as Program).methods
    .updatePlatformSettings(new BN(newPercent))
    .accounts({ updater: walletPk, programState })
    .rpc();
}

export async function listTransactionsByCampaign(cid: bigint) {
  const program = await getProgram();
  const all = await (program.account as any).transaction.all();
  const filtered = all.filter((acc: any) => {
    try {
      const v = BigInt(acc.account.cid?.toString?.() ?? acc.account.cid);
      return v === cid;
    } catch {
      return false;
    }
  });
  const rows = filtered
    .map((acc: any) => {
      const owner = acc.account.owner?.toString?.() ?? "";
      const amountLamports = BigInt((acc.account.amount as any)?.toString?.() ?? acc.account.amount);
      const amount = fromLamports(amountLamports);
      const timestamp = Number((acc.account.timestamp as any)?.toString?.() ?? acc.account.timestamp);
      const credited = !!acc.account.credited;
      return { owner, amount, timestamp, credited };
    })
    .sort((a: any, b: any) => b.timestamp - a.timestamp);
  return rows;
}

