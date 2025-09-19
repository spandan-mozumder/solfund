"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { WalletButton } from "./WalletProvider";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isActive = (path: string) =>
    pathname === path ? "text-foreground" : "text-muted-foreground hover:text-foreground";
  return (
    <header className="border-b sticky top-0 bg-background/80 backdrop-blur z-40">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">solfund</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className={isActive("/")}>Campaigns</Link>
          <Link href="/campaigns/new" className={isActive("/campaigns/new")}>Create</Link>
          <Link href="/settings" className={isActive("/settings")}>Settings</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/campaigns/new">New Campaign</Link>
          </Button>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
