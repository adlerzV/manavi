import { prisma } from "@/lib/prisma";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { CreateCategoryForm } from "@/components/admin/create-category-form";
import { CategoryManager, type CategoryRow } from "@/components/admin/category-manager";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      readingDirection: true,
      defaultReadingMode: true,
      showOnHomepage: true,
      isActive: true,
      sortOrder: true,
      _count: { select: { comics: true } },
    },
  });

  const rows: CategoryRow[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.imageUrl,
    readingDirection: c.readingDirection,
    defaultReadingMode: c.defaultReadingMode,
    showOnHomepage: c.showOnHomepage,
    isActive: c.isActive,
    sortOrder: c.sortOrder,
    comicCount: c._count.comics,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-text-main">دسته‌بندی‌های اصلی</h1>
        <p className="mt-1 text-sm text-text-muted">
          این دسته‌بندی‌ها (مانهوا، مانگا، کمیک، وبتون و...) پایه فیلتر «نوع اثر» در صفحه جستجو و ردیف‌های صفحه اصلی هستند.
        </p>
      </div>
      <CollapsibleSection triggerLabel="افزودن دسته‌بندی جدید">
        <CreateCategoryForm />
      </CollapsibleSection>
      <CategoryManager initialCategories={rows} />
    </div>
  );
}