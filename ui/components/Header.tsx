"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { WalletButton } from "./WalletProvider";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./ModeToggle";
import { Plus, Coins } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const isActive = (path: string) =>
    pathname === path ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground transition-colors";
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
            <Coins className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            SolFund
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className={isActive("/")}>
            Campaigns
          </Link>
          <Link href="/campaigns/new" className={isActive("/campaigns/new")}>
            Create
          </Link>
          <Link href="/settings" className={isActive("/settings")}>
            Settings
          </Link>
        </nav>
        
        <div className="flex items-center space-x-3">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/campaigns/new" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Campaign</span>
            </Link>
          </Button>
          <WalletButton />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
