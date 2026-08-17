import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border/60 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <Image src="/favicon.svg" alt="ماناوی" width={24} height={24} sizes="24px" className="rounded-md" />
          <span className="text-sm font-semibold text-text-main">ماناوی</span>
        </div>
        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} ماناوی — پلتفرم خوانش مانهوا و مانگا در تلگرام
        </p>
      </div>
    </footer>
  );
}