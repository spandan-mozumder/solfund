"use client";
import { Connection, PublicKey, SystemProgram, clusterApiUrl } from "@solana/web3.js";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import idlJson from "../../anchor/target/idl/solfund.json";

export type WalletAdapter = {
  publicKey: PublicKey | null;
  signTransaction: any;
  signAllTransactions: any;
};

export function getConnection() {
  const url = process.env.NEXT_PUBLIC_SOLANA_RPC ?? clusterApiUrl("devnet");
  return new Connection(url, "confirmed");
}

export async function getProvider() {
  const anyWindow = window as any;
  const sol = anyWindow?.solana;
  if (!sol?.isPhantom) throw new Error("Phantom wallet not found");
  await sol.connect();
  const wallet: WalletAdapter = sol;
  return new AnchorProvider(getConnection(), wallet as any, { commitment: "confirmed" });
}

export function getProgramId() {
  const fromEnv = process.env.NEXT_PUBLIC_PROGRAM_ID;
  return new PublicKey(fromEnv ?? (idlJson as any).address);
}

export async function getProgram() {
  const provider = await getProvider();
  const idl: any = { ...(idlJson as any), address: getProgramId().toBase58() };
  return new Program(idl as Idl, provider as any);
}

export const SYSTEM_PROGRAM_ID = SystemProgram.programId;
