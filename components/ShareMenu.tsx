"use client";
import { useEffect, useRef, useState } from "react";

const CHANNELS = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    icon: `<path d="M20.5 3.5A11.8 11.8 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.4-1.7a11.9 11.9 0 0 0 5.6 1.4h.1c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.3zM12 21.3h-.1c-1.7 0-3.4-.5-4.9-1.3l-.4-.2-3.6 1 1-3.5-.2-.4a9.7 9.7 0 0 1-1.5-5.2C2.3 6.4 6.7 2 12 2c2.6 0 5.1 1 6.9 2.9a9.7 9.7 0 0 1 2.9 6.9c0 5.3-4.4 9.5-9.8 9.5zm5.4-7.1c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.1-.2.1-.4 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9 1-.9 2.3 0 1.4 1 2.7 1.1 2.9.1.2 1.9 3 4.7 4.1 2.3.9 2.8.7 3.3.7.5-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.5-.3z"/>`,
    href: (url: string, text: string) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    key: "telegram",
    label: "Telegram",
    color: "#26A5E4",
    icon: `<path d="M22.2 2.6 2.9 10.3c-1.3.5-1.3 1.3-.2 1.6l4.9 1.5 1.9 5.8c.2.7.4 1 .9 1s.7-.2 1-.5l2.4-2.3 4.9 3.6c.9.5 1.5.2 1.8-.9l3.2-15.3c.4-1.4-.2-2-1.4-1.4zM8.6 13.2l10-6.3c.5-.3.9-.1.6.3L10.9 15l-.4 3-1.9-4.8z"/>`,
    href: (url: string, text: string) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    key: "email",
    label: "Email",
    color: "#3E79BD",
    icon: `<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>`,
    href: (url: string, text: string) => `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
  },
];

export default function ShareMenu({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="pdp-share" ref={ref}>
      <button type="button" className="pdp-copylink" onClick={() => setOpen((v) => !v)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <path d="m8.6 10.5 6.8-3.9M8.6 13.5l6.8 3.9" />
        </svg>
        Share
      </button>
      {open && (
        <div className="pdp-share-menu">
          {CHANNELS.map((c) => (
            <a
              key={c.key}
              href={c.href(typeof window !== "undefined" ? window.location.href : "", title)}
              target="_blank"
              rel="noopener noreferrer"
              className="pdp-share-item"
              onClick={() => setOpen(false)}
            >
              <span className="pdp-share-icon" style={{ background: c.color }}>
                <svg viewBox="0 0 24 24" fill="currentColor" dangerouslySetInnerHTML={{ __html: c.icon }} />
              </span>
              {c.label}
            </a>
          ))}
          <button type="button" className="pdp-share-item" onClick={handleCopyLink}>
            <span className="pdp-share-icon" style={{ background: "var(--ink-soft)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </span>
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
