import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { DonateButton } from "@/components/team/donate-button";

interface PageProps {
  params: Promise<{ publisherId: string }>;
}

export default async function PublisherPublicProfilePage({ params }: PageProps) {
  const { publisherId } = await params;

  const publisher = await prisma.publisher.findUnique({
    where: { id: publisherId },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      telegramUrl: true,
      instagramUrl: true,
      websiteUrl: true,
      donationCardNumber: true,
      donationLink: true,
      contractUserId: true,
      licenses: {
        select: {
          comics: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImage: true,
              chapters: { where: { publishedAt: { not: null } }, orderBy: { chapterNumber: "desc" }, take: 1, select: { chapterNumber: true } },
            },
          },
        },
      },
    },
  });

  if (!publisher) {
    notFound();
  }

  const user = await getSessionUser();
  const comics = publisher.licenses.flatMap((l) => l.comics);

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface text-xl font-medium text-text-main">
            {publisher.avatarUrl ? (
              <Image src={publisher.avatarUrl} alt={publisher.name} fill sizes="64px" className="object-cover" />
            ) : (
              publisher.name.charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-main">{publisher.name}</h1>
            <p className="text-xs text-text-muted">ناشر</p>
          </div>
        </div>

        {publisher.bio && <p className="mt-4 max-w-xl text-sm text-text-muted">{publisher.bio}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          {publisher.telegramUrl && (
            <a href={publisher.telegramUrl} target="_blank" rel="noreferrer" className="rounded-md border border-border px-3 py-1.5 text-xs text-text-main hover:border-primary">
              تلگرام
            </a>
          )}
          {publisher.instagramUrl && (
            <a href={publisher.instagramUrl} target="_blank" rel="noreferrer" className="rounded-md border border-border px-3 py-1.5 text-xs text-text-main hover:border-primary">
              اینستاگرام
            </a>
          )}
          {publisher.websiteUrl && (
            <a href={publisher.websiteUrl} target="_blank" rel="noreferrer" className="rounded-md border border-border px-3 py-1.5 text-xs text-text-main hover:border-primary">
              وب‌سایت
            </a>
          )}
        </div>

        <div className="mt-6 rounded-md border border-border bg-surface p-4">
          <h2 className="mb-3 text-sm font-medium text-text-main">حمایت مالی</h2>
          <div className="flex flex-wrap items-center gap-3">
            {publisher.contractUserId && (
              <DonateButton receiverId={publisher.contractUserId} authenticated={Boolean(user)} />
            )}
            {publisher.donationLink && (
              <a href={publisher.donationLink} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
                لینک دونیت خارجی
              </a>
            )}
            {publisher.donationCardNumber && (
              <span className="rounded-md bg-background px-3 py-1.5 text-xs text-text-muted">
                شماره کارت: {publisher.donationCardNumber}
              </span>
            )}
            {!publisher.contractUserId && !publisher.donationLink && !publisher.donationCardNumber && (
              <p className="text-xs text-text-muted">راه حمایت مالی هنوز ثبت نشده است.</p>
            )}
          </div>
        </div>

        <h2 className="mb-3 mt-8 text-sm font-medium text-text-main">آثار این ناشر</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {comics.map((comic) => (
            <Link key={comic.id} href={`/app/comic/${comic.slug}`} className="block">
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-surface">
                <Image src={comic.coverImage} alt={comic.title} fill sizes="(max-width: 768px) 50vw, 200px" className="object-cover" />
              </div>
              <p className="mt-2 truncate text-sm text-text-main">{comic.title}</p>
              {comic.chapters[0] && <p className="text-xs text-text-muted">چپتر {comic.chapters[0].chapterNumber.toLocaleString("fa-IR")}</p>}
            </Link>
          ))}
          {comics.length === 0 && <p className="col-span-full text-sm text-text-muted">هنوز عنوانی ثبت نشده است.</p>}
        </div>
      </div>
    </main>
  );
}