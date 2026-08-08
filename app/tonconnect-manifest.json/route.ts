import { NextResponse } from "next/server";

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_MINI_APP_URL ?? "";
  return NextResponse.json({
    url: baseUrl,
    name: "ماناوی",
    iconUrl: `${baseUrl}/favicon.svg`,
    termsOfUseUrl: baseUrl,
    privacyPolicyUrl: baseUrl,
  });
}