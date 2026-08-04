import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeamManager } from "@/components/publisher/team-manager";

export default async function PublisherTeamPage() {
  const user = await getSessionUser();
  if (!user?.publisherProfile) redirect("/publisher");

  const staff = await prisma.publisherStaff.findMany({
    where: { publisherId: user.publisherProfile.id },
    include: { user: { select: { firstName: true, username: true } } },
  });

  return <TeamManager initialStaff={staff} />;
}