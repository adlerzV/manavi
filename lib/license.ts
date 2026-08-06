import "server-only";
import { prisma } from "./prisma";
import { LicenseStatus, type License } from "@prisma/client";

export class LicenseInactiveError extends Error {
  constructor(public reason: string, public licenseId: string) {
    super(`License ${licenseId} is not active: ${reason}`);
    this.name = "LicenseInactiveError";
  }
}

export class ComicNotFoundError extends Error {
  constructor(public comicId: string) {
    super(`Comic ${comicId} not found`);
    this.name = "ComicNotFoundError";
  }
}

export async function assertLicenseActive(comicId: string): Promise<License> {
  const comic = await prisma.comic.findUnique({
    where: { id: comicId },
    include: { license: true },
  });

  if (!comic) {
    throw new ComicNotFoundError(comicId);
  }

  const license = comic.license;
  const now = new Date();

  if (license.terminatedAt) {
    throw new LicenseInactiveError("license was terminated", license.id);
  }
  if (license.status !== LicenseStatus.ACTIVE) {
    throw new LicenseInactiveError(`status is ${license.status}`, license.id);
  }
  if (license.startDate > now) {
    throw new LicenseInactiveError("startDate is in the future", license.id);
  }
  if (license.endDate && license.endDate < now) {
    throw new LicenseInactiveError("endDate has passed", license.id);
  }

  return license;
}

export interface LicenseActivityFields {
  status: LicenseStatus;
  terminatedAt: Date | null;
  startDate: Date;
  endDate: Date | null;
}

export function isLicenseCurrentlyActive(license: LicenseActivityFields): boolean {
  const now = new Date();
  if (license.terminatedAt) return false;
  if (license.status !== LicenseStatus.ACTIVE) return false;
  if (license.startDate > now) return false;
  if (license.endDate && license.endDate < now) return false;
  return true;
}