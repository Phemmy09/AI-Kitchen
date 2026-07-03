import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-panel-border">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <img src="/logo.svg" alt="RatedWorktops" className="h-9 w-9 rounded-lg" />
          <p className="mt-3 font-display text-base font-bold text-white">RatedWorktops</p>
          <p className="mt-2 text-sm text-white/40">
            AI-powered worktop visualisation. See your dream kitchen before it&apos;s built.
          </p>
        </div>
        <FooterColumn
          title="Product"
          links={[
            { href: "/visualiser", label: "Visualiser" },
            { href: "/stones", label: "Stone Library" },
            { href: "#how-it-works", label: "How It Works" },
            { href: "#pricing", label: "Pricing" },
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            { href: "/about", label: "About Us" },
            { href: "/contact", label: "Contact" },
          ]}
        />
        <FooterColumn
          title="Legal"
          links={[
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/terms", label: "Terms of Service" },
          ]}
        />
      </div>
      <div className="border-t border-panel-border px-6 py-4">
        <p className="mx-auto max-w-7xl text-xs text-white/30">
          © {new Date().getFullYear()} RatedWorktops. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-white/40">{title}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-white/60 hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
