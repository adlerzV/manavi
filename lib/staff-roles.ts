import type { StaffRole } from "@prisma/client";

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  LOCALIZATION_SPECIALIST: "مترجم",
  EDITOR: "ادیتور",
  CLEANER: "کلینر",
  TYPIST: "تایپیست",
};