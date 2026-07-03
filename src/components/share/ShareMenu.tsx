"use client";

import { useState } from "react";
import { Share2, Link2, Mail, Check } from "lucide-react";
import { logShare, type ShareChannel } from "@/lib/actions/shares";

const SHARE_TEXT = "Check out my kitchen visualised in real stone with RatedWorktops!";

export function ShareMenu({ renderId, imageUrl }: { renderId: string; imageUrl: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function share(channel: ShareChannel, url: string) {
    void logShare(renderId, channel);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(imageUrl);
    void logShare(renderId, "copy_link");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const encodedUrl = encodeURIComponent(imageUrl);
  const encodedText = encodeURIComponent(SHARE_TEXT);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-panel-border bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        <Share2 className="h-4 w-4" /> Share
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 z-10 mb-2 flex w-56 flex-col gap-1 rounded-lg border border-panel-border bg-panel p-2 shadow-xl"
          onMouseLeave={() => setOpen(false)}
        >
          <button
            onClick={() => share("whatsapp", `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
          >
            WhatsApp
          </button>
          <button
            onClick={() => share("facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
          >
            Facebook
          </button>
          <button
            onClick={() => share("linkedin", `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
          >
            LinkedIn
          </button>
          <button
            onClick={() => share("x", `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
          >
            X (Twitter)
          </button>
          <button
            onClick={() => share("email", `mailto:?subject=${encodedText}&body=${encodedUrl}`)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
          >
            <Mail className="h-4 w-4" /> Email
          </button>
          <button
            onClick={copyLink}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Link2 className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      )}
    </div>
  );
}
