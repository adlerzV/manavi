"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          backgroundColor: "#121212",
          color: "#ffffff",
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <p style={{ fontSize: "28px", fontWeight: 700, color: "#00DC64" }}>ماناوی</p>
        <p style={{ fontSize: "14px", color: "#AAAAAA", maxWidth: "320px" }}>
          مشکلی در بارگذاری اپلیکیشن پیش آمد. لطفاً دوباره تلاش کنید.
        </p>
        <button
          onClick={reset}
          style={{
            borderRadius: "6px",
            backgroundColor: "#00DC64",
            color: "#ffffff",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
          }}
        >
          تلاش دوباره
        </button>
      </body>
    </html>
  );
}