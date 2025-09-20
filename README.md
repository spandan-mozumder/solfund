# SolFund — Solana Crowdfunding (Anchor + Next.js)

SolFund is a full-stack crowdfunding platform built on Solana. It lets anyone create, fund, manage, and withdraw from on-chain campaigns using a friendly, modern web UI.

- On-chain program: Anchor (Rust), deployed to Solana devnet
- Frontend: Next.js App Router (React 19), Tailwind CSS (shadcn/ui), Wallet Adapter
- Program IDL: consumed by the UI for seamless RPC calls


## Features
- Create and manage crowdfunding campaigns on Solana devnet
- Donate SOL to campaigns securely via Phantom or other compatible wallets
- Update campaign details and withdraw funds (campaign owners)
- Platform-level settings such as currency symbol, minimum donation, and platform fee
- Clean, professional, and responsive UI with modern components and animations


## Repository Structure
```
anchor/               # Anchor workspace for the on-chain program
  Anchor.toml         # Devnet cluster and workspace config
  programs/anchor/    # Program crate (Rust + Anchor macros)
  target/idl/         # Generated IDL (solfund.json)
  migrations/         # Optional deployment scripts
ui/                   # Next.js (App Router) frontend
  app/                # Routes and layouts
  components/         # UI components (shadcn)
  lib/                # Solana + Anchor client utilities
  public/             # Static assets
README.md             # This file
```


## Prerequisites
- Node.js 18+ and pnpm/npm/yarn
- Rust + Solana CLI + Anchor CLI for program development
- Phantom wallet (or compatible) for testing the UI

Useful versions (from codebase):
- Anchor: `@coral-xyz/anchor@^0.31.1`
- Next.js: `15.x`, React 19


## Configure Environment
The UI reads these environment variables:

- `NEXT_PUBLIC_SOLANA_RPC` — RPC endpoint (defaults to devnet)
- `NEXT_PUBLIC_PROGRAM_ID` — Program ID (falls back to ID in `anchor/target/idl/solfund.json`)

Create `ui/.env.local` (example):
```
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
# Optionally override if you deploy your own program
# NEXT_PUBLIC_PROGRAM_ID=5zsv86BY2w6wjAn4XicUkTmQQy5spGYUC6b15fRMMraa
```

Note: `anchor/Anchor.toml` includes a devnet entry and registry URL. The Anchor provider wallet is read from `~/.config/solana/id.json`.


## Run the Frontend
From the `ui` folder:

```bash
# with pnpm
pnpm install
pnpm dev

# or with npm
npm install
npm run dev

# or with yarn
yarn
yarn dev

# or using Bun (if installed)
bun install
bun run dev
```

Then open the app at:
- http://localhost:3000

The app will prompt your Phantom wallet to connect when needed.


## Develop and Test the Program (optional)
If you want to work on the on-chain program:

- Ensure Solana and Anchor CLIs are installed and configured for devnet
- Program sources live in `anchor/programs/anchor`
- The workspace uses Anchor 0.31.x and Rust 2021 edition

Common Anchor commands (run inside `anchor/`):
```bash
# Build the program
anchor build

# Run tests (uses ts-mocha per Anchor.toml)
pnpm test   # or npm run test / yarn test

# Deploy to devnet (requires a funded keypair)
anchor deploy
```

After deploying, update the frontend to point to your program:
- Set `NEXT_PUBLIC_PROGRAM_ID` in `ui/.env.local`, or
- Replace the address in `anchor/target/idl/solfund.json` and rebuild the UI


## Key Files
- `ui/lib/anchorClient.ts` — Connection, provider, and program helpers. Pulls IDL from `anchor/target/idl/solfund.json` and reads env vars.
- `ui/components/WalletProvider.tsx` — Sets up Solana Wallet Adapter with the devnet endpoint.
- `ui/lib/blockchain.ts` — High-level RPC wrappers (create/update/delete/donate/withdraw, platform settings).


## Notes
- The UI is designed for devnet testing. For mainnet, set `NEXT_PUBLIC_SOLANA_RPC` and ensure your program is deployed/mainnet-compatible.
- ESLint is configured to be ignored during Next build (see `ui/next.config.ts`).
- Some Anchor warnings in Rust may appear if your local toolchain version differs; keep Anchor and Solana toolchains aligned.


## License
This project is for educational and demonstration purposes. See individual package licenses.
