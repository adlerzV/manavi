import { redirect } from "next/navigation";
import { getSessionUser, getPublisherContext } from "@/lib/auth";
import { PublisherProfileForm } from "@/components/publisher/profile-form";
import { parseCustomLinks } from "@/lib/profile-links";

export default async function PublisherProfilePage() {
  const user = await getSessionUser();
  const context = await getPublisherContext(user);

  if (!context) {
    if (user?.role !== "ADMIN") redirect("/publisher");
    return (
      <div className="rounded-md border border-border bg-surface p-6 text-sm text-text-muted">
        حساب شما به هیچ ناشری متصل نیست.
      </div>
    );
  }
  if (!context.isOwner || !user?.publisherProfile) {
    return (
      <div className="rounded-md border border-border bg-surface p-6 text-sm text-text-muted">
        فقط ناشر اصلی می‌تواند پروفایل را ویرایش کند.
      </div>
    );
  }

  return (
    <PublisherProfileForm
      initial={{
        bio: user.publisherProfile.bio,
        avatarUrl: user.publisherProfile.avatarUrl,
        telegramUrl: user.publisherProfile.telegramUrl,
        instagramUrl: user.publisherProfile.instagramUrl,
        websiteUrl: user.publisherProfile.websiteUrl,
        donationCardNumber: user.publisherProfile.donationCardNumber,
        donationLink: user.publisherProfile.donationLink,
        cryptoWalletLabel: user.publisherProfile.cryptoWalletLabel,
        cryptoWalletAddress: user.publisherProfile.cryptoWalletAddress,
        customLinks: parseCustomLinks(user.publisherProfile.customLinks),
      }}
    />
  );
}