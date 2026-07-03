import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Upload, Palette, Sparkles, Scan, SunMedium, Layers, Smartphone, Apple, Check } from "lucide-react";
import { getStoneCatalog } from "@/lib/data/stones";
import { getPlatformSettings } from "@/lib/data/settings";
import { PublicNavbar } from "@/components/marketing/PublicNavbar";
import { Footer } from "@/components/marketing/Footer";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerReveal } from "@/components/motion/StaggerReveal";

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

export default async function Home() {
  const [{ brands }, settings] = await Promise.all([getStoneCatalog(), getPlatformSettings()]);
  const featuredColours = brands.flatMap((b) => b.stone_colours.map((c) => ({ ...c, brandName: b.name }))).slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0d]">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-panel-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(202,161,93,0.12),_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <p className="fade-up text-xs font-semibold uppercase tracking-widest text-brand-gold">
            The RatedWorktops Visualiser
          </p>
          <h1 className="fade-up-2 mt-4 max-w-2xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            See your kitchen in <span className="text-brand-gold">real stone</span>, before you buy it.
          </h1>
          <p className="fade-up-3 mt-5 max-w-xl text-base text-white/60">
            Upload a photo of your kitchen, choose a stone from our gallery, and our AI visualiser renders your
            worktop and splashback in the exact material - photorealistic, in seconds.
          </p>
          <div className="fade-up-4 mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-lg bg-gradient-to-b from-brand-gold to-brand-gold-light px-6 py-3 text-sm font-semibold text-black shadow-[0_2px_12px_rgba(201,169,110,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(201,169,110,0.18)]"
            >
              Try with free credits{" "}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <a href="#how-it-works" className="text-sm font-semibold text-white/70 transition-colors hover:text-white">
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
        <FadeIn className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold">Workflow</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white">See Your Dream Kitchen in 3 Steps</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/50">
            Visualising kitchen worktops is fast, realistic and completely friction-free.
          </p>
        </FadeIn>

        <StaggerReveal className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Step icon={Upload} step="01" title="Upload a Photo" description="Upload a photo of your existing kitchen worktop, island or splashback." />
          <Step icon={Palette} step="02" title="Select Stone Material" description="Browse our library of premium stone brands, sorted by category - Marble, Quartz, Granite and more." />
          <Step icon={Sparkles} step="03" title="Generate AI Visualisation" description="Our AI automatically detects your surfaces and replaces them - keeping realistic shadows and lighting." />
        </StaggerReveal>
      </section>

      {/* Curated materials */}
      {featuredColours.length > 0 && (
        <section className="border-y border-panel-border bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <FadeIn className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold">Stone Library</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-white">Curated Materials</h2>
              </div>
              <Link href="/stones" className="text-sm font-semibold text-brand-gold hover:underline">
                View Entire Library &rarr;
              </Link>
            </FadeIn>
            <StaggerReveal className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {featuredColours.map((colour) => (
                <div
                  key={colour.id}
                  className="group overflow-hidden rounded-xl border border-panel-border transition-all duration-200 hover:-translate-y-1 hover:border-[color:var(--border-gold)] hover:shadow-[0_8px_40px_rgba(201,169,110,0.18)]"
                >
                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                      src={colour.texture_url}
                      alt={colour.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-white">{colour.name}</p>
                    <p className="text-xs text-white/40">{colour.brandName}</p>
                  </div>
                </div>
              ))}
            </StaggerReveal>
          </div>
        </section>
      )}

      {/* Accuracy features */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <FadeIn className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold">High Fidelity</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white">Designed for Stunning Accuracy</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/50">
            More than a template swap - our AI matches textures to your room&apos;s unique geometry and lighting.
          </p>
        </FadeIn>

        <StaggerReveal className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Feature icon={Scan} title="Automatic Surface Detection" description="No manual masking - the AI finds your worktop, splashback and island surfaces on its own." />
          <Feature icon={SunMedium} title="Natural Light Integration" description="Preserves your kitchen's ambient lighting and reflections for a photorealistic finish." />
          <Feature icon={Layers} title="Detailed Texture Resolution" description="High-resolution marble veining and granite grain, without blurring or tiling artifacts." />
        </StaggerReveal>
      </section>

      {/* Mobile apps */}
      <section className="border-y border-panel-border bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-20 lg:grid-cols-2">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold">Coming Soon</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white">Take RatedWorktops with you</h2>
            <p className="mt-4 max-w-md text-sm text-white/60">
              The full visualiser experience is coming to iOS and Android, so you can snap a photo and see it in
              stone right from your kitchen.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="flex items-center gap-2 rounded-lg border border-panel-border bg-white/5 px-4 py-2.5 text-sm text-white/60 transition-colors hover:border-[color:var(--border-gold)] hover:text-white">
                <Apple className="h-4 w-4" /> App Store - Coming Soon
              </span>
              <span className="flex items-center gap-2 rounded-lg border border-panel-border bg-white/5 px-4 py-2.5 text-sm text-white/60 transition-colors hover:border-[color:var(--border-gold)] hover:text-white">
                <Smartphone className="h-4 w-4" /> Google Play - Coming Soon
              </span>
            </div>
          </FadeIn>
          <FadeIn delay={0.15} className="flex justify-center gap-4">
            <PhoneMockup label="Upload & Detect" />
            <PhoneMockup label="Realistic Render" offset />
          </FadeIn>
        </div>
      </section>

      {/* Pricing */}
      {settings.subscriptions_enabled ? (
        <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
          <FadeIn className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold">Plans</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white">Transparent & Flexible Pricing</h2>
          </FadeIn>

          <StaggerReveal className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            <PriceCard title="Starter" price="$0" period="" credits={`${settings.free_credit_amount} credits on signup`} />
            <PriceCard
              title="Pro"
              price={formatPrice(settings.monthly_price_cents, settings.currency)}
              period="/month"
              credits={`${settings.monthly_credits} visualisations / month`}
              highlight
            />
            <PriceCard
              title="Studio"
              price={formatPrice(settings.annual_price_cents, settings.currency)}
              period="/year"
              credits={`${settings.annual_credits} visualisations / year`}
            />
          </StaggerReveal>
        </section>
      ) : (
        <section id="pricing" className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl font-bold text-white">Free, Unlimited Visualisations</h2>
          <p className="mt-3 text-sm text-white/50">Subscriptions are currently disabled - every render is on us.</p>
        </section>
      )}

      <Footer />
    </div>
  );
}

function Step({
  icon: Icon,
  step,
  title,
  description,
}: {
  icon: typeof Upload;
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="gold-edge rounded-2xl border border-panel-border bg-white/5 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[color:var(--border-gold)] hover:shadow-[0_8px_40px_rgba(201,169,110,0.18)]">
      <p className="font-display text-xs font-bold text-brand-gold">{step}</p>
      <Icon className="mt-3 h-6 w-6 text-brand-gold" />
      <h3 className="mt-3 font-display text-base font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-white/50">{description}</p>
    </div>
  );
}

function Feature({ icon: Icon, title, description }: { icon: typeof Scan; title: string; description: string }) {
  return (
    <div className="gold-edge rounded-2xl border border-panel-border bg-white/5 p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[color:var(--border-gold)] hover:shadow-[0_8px_40px_rgba(201,169,110,0.18)]">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-display text-base font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-white/50">{description}</p>
    </div>
  );
}

function PhoneMockup({ label, offset }: { label: string; offset?: boolean }) {
  return (
    <div
      className={`flex h-72 w-40 flex-col items-center justify-end gap-3 rounded-[2rem] border-4 border-white/10 bg-gradient-to-b from-white/5 to-transparent p-4 transition-transform duration-300 hover:-translate-y-2 ${
        offset ? "mt-8" : ""
      }`}
    >
      <Sparkles className="h-8 w-8 text-brand-gold" />
      <p className="text-center text-xs text-white/50">{label}</p>
    </div>
  );
}

function PriceCard({
  title,
  price,
  period,
  credits,
  highlight,
}: {
  title: string;
  price: string;
  period: string;
  credits: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 ${
        highlight
          ? "border-brand-gold bg-brand-gold/5 hover:shadow-[0_8px_40px_rgba(201,169,110,0.18)]"
          : "border-panel-border bg-white/5 hover:border-[color:var(--border-gold)]"
      }`}
    >
      {highlight && (
        <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-b from-brand-gold to-brand-gold-dark px-3 py-1 text-[10px] font-bold uppercase text-black">
          Most Popular
        </span>
      )}
      <p className="font-display text-lg font-bold text-white">{title}</p>
      <p className="mt-2 text-3xl font-bold text-white">
        {price}
        <span className="text-sm font-normal text-white/40">{period}</span>
      </p>
      <p className="mt-3 flex items-center gap-1.5 text-sm text-white/60">
        <Check className="h-4 w-4 text-brand-gold" /> {credits}
      </p>
      <Link
        href="/register"
        className="mt-5 block rounded-lg bg-gradient-to-b from-brand-gold to-brand-gold-dark px-5 py-2.5 text-center text-sm font-semibold text-black transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_2px_12px_rgba(201,169,110,0.3)]"
      >
        Get Started
      </Link>
    </div>
  );
}
