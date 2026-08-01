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

/**
 * Throws unless the given comic's license is genuinely in force right now:
 * status ACTIVE, not terminated, and today falls within [startDate, endDate].
 *
 * Call this in the chapter-publish Server Action before setting
 * Chapter.publishedAt, and again in the chapter-read route before serving
 * page URLs — a license can expire between publish time and read time.
 *
 * Returns the License row on success so callers can reuse it (e.g. to
 * check territory) without a second query.
 */
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
