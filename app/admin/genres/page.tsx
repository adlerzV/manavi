// app/admin/genres/page.tsx
import { prisma } from "@/lib/prisma";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { CreateGenreForm } from "@/components/admin/create-genre-form";
import { GenreManager } from "@/components/admin/genre-manager";

export default async function AdminGenresPage() {
  const genres = await prisma.genre.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      _count: { select: { comics: true } },
    },
  });

  const genreRows = genres.map((g) => ({
    id: g.id,
    name: g.name,
    imageUrl: g.imageUrl,
    comicCount: g._count.comics,
  }));

  return (
    <div className="space-y-8">
      <CollapsibleSection triggerLabel="افزودن دسته‌بندی جدید">
        <CreateGenreForm />
      </CollapsibleSection>
      <GenreManager genres={genreRows} />
    </div>
  );
}