import { PublicKey } from "@solana/web3.js";
import { getProgramId } from "./anchorClient";

export function toLittleEndianU64(n: bigint) {
  const arr = new Uint8Array(8);
  const dv = new DataView(arr.buffer);
  dv.setBigUint64(0, n, true);
  return arr;
}

export async function programStatePda() {
  const [pda] = PublicKey.findProgramAddressSync([Buffer.from("program_state")], getProgramId());
  return pda;
}

export function campaignPda(cid: bigint) {
  const [pda] = PublicKey.findProgramAddressSync([Buffer.from("campaign"), Buffer.from(toLittleEndianU64(cid))], getProgramId());
  return pda;
}

export function donorTransactionPda(donor: PublicKey, cid: bigint, index: bigint) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("donor"), donor.toBuffer(), Buffer.from(toLittleEndianU64(cid)), Buffer.from(toLittleEndianU64(index))],
    getProgramId()
  );
  return pda;
}

export function withdrawTransactionPda(creator: PublicKey, cid: bigint, index: bigint) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("withdraw"), creator.toBuffer(), Buffer.from(toLittleEndianU64(cid)), Buffer.from(toLittleEndianU64(index))],
    getProgramId()
  );
  return pda;
}
