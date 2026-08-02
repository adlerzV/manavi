import Script from "next/script";

export function AdsgramScript() {
  return <Script src="https://sad.adsgram.ai/js/sad.min.js" strategy="afterInteractive" />;
}