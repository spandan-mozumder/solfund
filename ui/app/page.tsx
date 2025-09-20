"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { CampaignCard } from "@/components/CampaignCard";
import { Plus, TrendingUp, Users, Target, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const { state } = useStore();
  const ids = state.campaigns.map((c) => c.id);
  const activeCampaigns = state.campaigns.filter(c => c.status === 'active');
  const totalRaised = state.campaigns.reduce((sum, c) => sum + c.amountRaised, 0);
  const totalBackers = Math.floor(Math.random() * 500) + 150; // Simulated

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="mx-auto max-w-4xl space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Fund the
            <span className="block gradient-text">
              Future Together
            </span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Create, discover, and support meaningful projects on Solana. 
            Turn your ideas into reality with community-powered crowdfunding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg">
              <Link href="/campaigns/new" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Start Your Campaign
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2">
              <Link href="#campaigns" className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Explore Campaigns
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-12">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold">{totalRaised.toFixed(1)} SOL</div>
              <div className="text-sm text-muted-foreground">Total Raised</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold">{totalBackers}</div>
              <div className="text-sm text-muted-foreground">Community Members</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold">{activeCampaigns.length}</div>
              <div className="text-sm text-muted-foreground">Active Campaigns</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Campaigns Section */}
      <section id="campaigns" className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Campaigns</h2>
            <p className="text-muted-foreground mt-2">Discover and support amazing projects from our community</p>
          </div>
          <Button asChild variant="outline" className="hidden sm:flex">
            <Link href="/campaigns/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Campaign
            </Link>
          </Button>
        </div>
        
        {ids.length === 0 ? (
          <Card className="border-2 border-dashed border-muted-foreground/25 bg-gradient-to-br from-muted/30 to-muted/10">
            <CardContent className="text-center py-16 px-6">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Be the first to create a campaign and start building something amazing with community support.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/campaigns/new" className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create Your First Campaign
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/settings">
                    Configure Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {ids.map((id) => (
              <CampaignCard key={id} id={id} />
            ))}
          </div>
        )}
      </section>
      
      {/* Call to Action */}
      {ids.length > 0 && (
        <section className="text-center py-16">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-12">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Your Own Campaign?</h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Join our community of creators and bring your vision to life with the power of crowdfunding.
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80">
                <Link href="/campaigns/new" className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Launch Your Campaign
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
