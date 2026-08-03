"use client";

import { useState } from "react";
import { useEffect } from "react";

const MOBILE_UA_PATTERN = /android|iphone|ipad|ipod|iemobile|blackberry|opera mini|mobile/i;
const NATIVE_APP_FALLBACK_MS = 1500;

interface TelegramCtaProps {
  webLink: string;
  nativeLink: string;
  qrCodeSvg: string;
}

export function TelegramCta({ webLink, nativeLink, qrCodeSvg }: TelegramCtaProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMobile(MOBILE_UA_PATTERN.test(navigator.userAgent));
  }, []);

  function handleOpenClick() {
    const fallbackTimer = setTimeout(() => {
      window.location.href = webLink;
    }, NATIVE_APP_FALLBACK_MS);

    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) clearTimeout(fallbackTimer);
      },
      { once: true }
    );

    window.location.href = nativeLink;
  }

  if (isMobile === null) {
    return <div className="h-14 w-full max-w-xs rounded-md bg-surface" />;
  }

  if (isMobile) {
    return (
      <button
        onClick={handleOpenClick}
        className="flex w-full max-w-xs items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
      >
        باز کردن مینی‌اپ در تلگرام
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-border bg-surface p-6">
      <div
        className="h-40 w-40 [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
      />
      <p className="text-xs text-text-muted">با دوربین گوشی اسکن کنید</p>
    </div>
  );
}