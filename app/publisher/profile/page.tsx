import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { PublisherProfileForm } from "@/components/publisher/profile-form";

export default async function PublisherProfilePage() {
  const user = await getSessionUser();
  if (!user?.publisherProfile) redirect("/publisher");

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
      }}
    />
  );
}