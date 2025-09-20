export type CampaignStatus = "active" | "completed" | "cancelled";

export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetAmount: number; // in lamports-equivalent for UI; plain number
  amountRaised: number;
  deadline?: string; // ISO date string
  owner?: string; // pubkey string (optional in UI)
  createdAt: string; // ISO
  status: CampaignStatus;
  completionMessage?: string;
}

export interface PlatformSettings {
  currencySymbol: string; // e.g. SOL
  minDonation: number; // minimum donation amount in SOL
  platformFeePercent: number; // integer percent from chain
}

export interface AppState {
  campaigns: Campaign[];
  settings: PlatformSettings;
}

export type CreateCampaignInput = {
  title: string;
  description: string;
  imageUrl?: string;
  targetAmount: number; // SOL
  deadline?: string;
};

export type UpdateCampaignInput = Partial<CreateCampaignInput> & { id: string };
