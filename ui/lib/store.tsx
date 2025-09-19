"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AppState,
  Campaign,
  CreateCampaignInput,
  PlatformSettings,
  UpdateCampaignInput,
} from "./types";
import { listCampaigns, rpcCreateCampaign, rpcDeleteCampaign, rpcDonate, rpcUpdateCampaign, rpcWithdraw, getProgramState, fromLamports, rpcUpdatePlatformFee } from "./blockchain";

const defaultSettings: PlatformSettings = { currencySymbol: "SOL", minDonation: 0.1, platformFeePercent: 5 };

const initialState: AppState = {
  campaigns: [],
  settings: defaultSettings,
};

type StoreContextType = {
  state: AppState;
  createCampaign: (input: CreateCampaignInput) => Promise<Campaign>;
  updateCampaign: (input: UpdateCampaignInput) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  donate: (id: string, amount: number) => Promise<void>;
  withdraw: (id: string, amount?: number) => Promise<void>;
  updateSettings: (settings: Partial<PlatformSettings>) => Promise<void>;
  resetAll: () => void;
};

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = "solfund-ui-state-v1";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  useEffect(() => {
    (async () => {
      try {
        const onchain = await listCampaigns();
        const mapped: Campaign[] = onchain.campaigns.map(({ data }) => ({
          id: data.cid.toString(),
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl ?? data.image_url,
          targetAmount: fromLamports(BigInt((data.goal as any).toString?.() ?? data.goal)),
          amountRaised: fromLamports(BigInt(((data.amountRaised ?? data.amount_raised) as any).toString?.() ?? (data.amountRaised ?? data.amount_raised))),
          deadline: undefined,
          owner: data.creator?.toString?.(),
          createdAt: new Date(Number(((data.timestamp as any).toString?.() ?? data.timestamp)) * 1000).toISOString(),
          status: data.active ? "active" : "completed",
        }));
        const st = await getProgramState(onchain.program);
        setState({
          campaigns: mapped,
          settings: {
            currencySymbol: "SOL",
            minDonation: 0.1,
            platformFeePercent: Number(st.data.platformFee ?? st.data.platform_fee),
          },
        });
      } catch {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) setState(JSON.parse(raw));
        } catch {}
      }
    })();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const createCampaign = useCallback((input: CreateCampaignInput) => {
    return (async () => {
      const res = await rpcCreateCampaign({
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl ?? "",
        goalSol: input.targetAmount,
      });
      const id = res.cid.toString();
      const now = new Date().toISOString();
      const newCamp: Campaign = { id, title: input.title, description: input.description, imageUrl: input.imageUrl, targetAmount: input.targetAmount, amountRaised: 0, deadline: input.deadline, owner: undefined, createdAt: now, status: "active" };
      setState((prev) => ({ ...prev, campaigns: [newCamp, ...prev.campaigns] }));
      return newCamp;
    })();
  }, []);

  const updateCampaign = useCallback((input: UpdateCampaignInput) => {
    return (async () => {
      await rpcUpdateCampaign(BigInt(input.id), {
        title: input.title ?? "",
        description: input.description ?? "",
        imageUrl: input.imageUrl ?? "",
        goalSol: input.targetAmount ?? 1,
      });
      setState((prev) => ({ ...prev, campaigns: prev.campaigns.map((c) => (c.id === input.id ? { ...c, ...input } : c)) }));
    })();
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    return (async () => {
      await rpcDeleteCampaign(BigInt(id));
      setState((prev) => ({ ...prev, campaigns: prev.campaigns.filter((c) => c.id !== id) }));
    })();
  }, []);

  const donate = useCallback((id: string, amount: number) => {
    return (async () => {
      await rpcDonate(BigInt(id), amount);
      setState((prev) => ({ ...prev, campaigns: prev.campaigns.map((c) => (c.id === id ? { ...c, amountRaised: c.amountRaised + amount } : c)) }));
    })();
  }, []);

  const withdraw = useCallback((id: string, amount?: number) => {
    return (async () => {
      const amt = amount ?? state.campaigns.find((c) => c.id === id)?.amountRaised ?? 0;
      await rpcWithdraw(BigInt(id), amt);
      setState((prev) => ({ ...prev, campaigns: prev.campaigns.map((c) => (c.id === id ? { ...c, amountRaised: Math.max(0, c.amountRaised - amt) } : c)) }));
    })();
  }, [state.campaigns]);

  const updateSettings = useCallback((settings: Partial<PlatformSettings>) => {
    return (async () => {
      if (typeof settings.platformFeePercent === "number") {
        await rpcUpdatePlatformFee(settings.platformFeePercent);
      }
      setState((prev) => ({ ...prev, settings: { ...prev.settings, ...settings } }));
    })();
  }, []);

  const resetAll = useCallback(() => setState(initialState), []);

  const value = useMemo(
    () => ({
      state,
      createCampaign,
      updateCampaign,
      deleteCampaign,
      donate,
      withdraw,
      updateSettings,
      resetAll,
    }),
    [state, createCampaign, updateCampaign, deleteCampaign, donate, withdraw, updateSettings, resetAll]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
