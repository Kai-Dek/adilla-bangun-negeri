"use client";

import { useCallback, useMemo, useState } from "react";
import { Share2, Link as LinkIcon, Copy, X as XIcon } from "lucide-react";
import { usePathname } from "next/navigation";

interface ShareButtonProps {
  title: string;
  /** Optional absolute URL; if not provided, will build from location + path */
  urlPath?: string;
}

export default function ShareButton({ title, urlPath }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return urlPath || pathname || "/";
    const origin = window.location.origin;
    const path = urlPath || pathname || "/";
    try {
      // Ensure absolute URL
      const url = new URL(path, origin);
      return url.toString();
    } catch {
      return `${origin}${path}`;
    }
  }, [pathname, urlPath]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [shareUrl]);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const links = useMemo(
    () => ({
      whatsapp: `https://wa.me/?text=${encodedTitle}%20-%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    }),
    [encodedTitle, encodedUrl]
  );

  const tryNativeShare = useCallback(() => {
    // Always use website popup (do not trigger OS native share)
    setOpen(true);
  }, []);

  const handleWhatsApp = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const text = `${title} - ${shareUrl}`;
      const appUrl = `whatsapp://send?text=${encodeURIComponent(text)}`;
      const webUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(
        navigator.userAgent
      );

      if (isMobile) {
        // On mobile, deep-link to app
        window.location.href = appUrl;
      } else {
        // On desktop, try desktop app, then fallback to WhatsApp Web
        const appWindow = window.open(appUrl, "_blank");
        setTimeout(() => {
          try {
            if (appWindow && !appWindow.closed) {
              // If appWindow didn't navigate, open web fallback
              appWindow.location.href = webUrl;
            } else {
              window.open(webUrl, "_blank");
            }
          } catch {
            window.open(webUrl, "_blank");
          }
        }, 700);
      }
    },
    [shareUrl, title]
  );

  // Brand icons (inline SVGs) for clarity and no extra assets
  const IconWhatsApp = () => (
    <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
      <path
        fill="#25D366"
        d="M16 3C9.373 3 4 8.373 4 15c0 2.125.525 4.126 1.45 5.9L4 29l8.3-1.425A12 12 0 1 0 16 3Zm0 2.4A9.6 9.6 0 1 1 6.4 15 9.6 9.6 0 0 1 16 5.4Z"
      />
      <path
        fill="#fff"
        d="M12.9 10.6c-.3-.7-.6-.7-.9-.7h-.8c-.3 0-.8.1-1.2.6s-1.6 1.6-1.6 3.9 1.7 4.6 1.9 4.9 3.2 4.9 7.9 6.6c3.9 1.5 4.7 1.2 5.6 1.1.8-.1 2.8-1.1 3.2-2.3.4-1.2.4-2.2.3-2.4-.1-.2-.5-.4-1-.7s-2.8-1.4-3.2-1.6-.7-.2-1 .2-1.2 1.6-1.4 1.9-.5.3-.9.1-1.8-.7-3.4-2.1c-1.3-1.1-2.1-2.5-2.4-2.9-.3-.5 0-.7.2-.9.2-.2.5-.5.7-.8.2-.3.3-.5.5-.8.2-.3.1-.6 0-.8-.1-.2-.8-2.1-1.1-2.8Z"
      />
    </svg>
  );
  const IconFacebook = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
      <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.093 10.125 24v-8.437H7.078V12.07h3.047V9.412c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.96h-1.514c-1.492 0-1.956.93-1.956 1.887v2.244h3.328l-.532 3.492h-2.796V24C19.612 23.093 24 18.1 24 12.073Z"/>
      <path fill="#fff" d="M16.671 15.563 17.203 12.07h-3.328V9.826c0-.958.464-1.887 1.956-1.887h1.514V4.98s-1.374-.235-2.686-.235c-2.741 0-4.533 1.66-4.533 4.667v2.659H7.078v3.494h3.047V24h3.75v-8.437h2.796z"/>
    </svg>
  );
  const IconX = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
      <path fill="#000" d="M18.244 2H21l-6.36 7.273L22 22h-6.828l-4.74-6.232L4.8 22H2l6.84-7.833L2.2 2h6.899l4.3 5.74L18.244 2Zm-2.394 18h1.326L8.22 4H6.86l8.99 16Z"/>
    </svg>
  );
  const IconTelegram = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
      <path fill="#229ED9" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Z"/>
      <path fill="#fff" d="M17.91 7.56c.204-.9-.325-1.25-1.1-.92L5.64 11.45c-.86.345-.845.825-.147 1.04l2.9.905 6.72-4.24c.317-.192.606-.088.368.122l-5.44 4.89-.2 2.95c.29 0 .418-.133.58-.29l1.39-1.35 2.89 2.13c.532.293.915.14 1.05-.494L17.91 7.56Z"/>
    </svg>
  );

  return (
    <>
      <button
        onClick={tryNativeShare}
        className="w-full bg-gray-100 text-gray-700 py-3 rounded-md hover:bg-gray-200 transition font-medium flex items-center justify-center gap-2"
      >
        <Share2 className="w-5 h-5" />
        Bagikan
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-4 sm:p-6 m-0 sm:m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Bagikan</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
                aria-label="Tutup"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                <LinkIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 truncate">{shareUrl}</span>
                <button
                  onClick={handleCopy}
                  className="ml-auto inline-flex items-center gap-2 text-sm bg-[#f97316] text-white px-3 py-1.5 rounded-md hover:bg-[#ea580c]"
                >
                  <Copy className="w-4 h-4" /> {copied ? "Tersalin" : "Salin"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <a
                href={links.whatsapp}
                onClick={handleWhatsApp}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                <IconWhatsApp />
                <span className="text-xs text-gray-700">WhatsApp</span>
              </a>
              <a
                href={links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                <IconFacebook />
                <span className="text-xs text-gray-700">Facebook</span>
              </a>
              <a
                href={links.x}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                <IconX />
                <span className="text-xs text-gray-700">X</span>
              </a>
              <a
                href={links.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                <IconTelegram />
                <span className="text-xs text-gray-700">Telegram</span>
              </a>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


