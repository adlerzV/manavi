import { prisma } from "@/lib/prisma";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { CreateGenreForm } from "@/components/admin/create-genre-form";
import { GenreManager } from "@/components/admin/genre-manager";

export default async function AdminGenresPage() {
  const genres = await prisma.genre.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { comics: true } } },
  });

  return (
    <div className="space-y-8">
      <CollapsibleSection triggerLabel="افزودن دسته‌بندی جدید">
        <CreateGenreForm />
      </CollapsibleSection>

      <GenreManager
        genres={genres.map((g) => ({ id: g.id, name: g.name, imageUrl: g.imageUrl, comicCount: g._count.comics }))}
      />
    </div>
  );
}