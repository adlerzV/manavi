"use client";

import { PointerParallaxProvider } from "./pointer-parallax-provider";
import { HeroSection } from "./hero-section";
import { StatBand } from "./stat-band";
import { FeatureGrid } from "./feature-grid";
import { ReaderPreview } from "./reader-preview";
import { CreatorCtaSection } from "./creator-cta-section";
import { SiteFooter } from "./site-footer";
import type { SiteStats } from "@/lib/site-stats";
import type { TelegramLinks } from "@/lib/site-config";

interface LandingPageProps {
  stats: SiteStats;
  links: TelegramLinks | null;
  qrCodeSvg: string | null;
}

export function LandingPage({ stats, links, qrCodeSvg }: LandingPageProps) {
  return (
    <PointerParallaxProvider>
      <main className="relative min-h-screen overflow-x-clip bg-background text-text-main">
        <HeroSection links={links} qrCodeSvg={qrCodeSvg} />
        <StatBand stats={stats} />
        <FeatureGrid />
        <ReaderPreview links={links} />
        <CreatorCtaSection />
        <SiteFooter />
      </main>
    </PointerParallaxProvider>
  );
}