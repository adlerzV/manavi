"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface AuthUser {
  id: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  role: string;
}

interface TelegramAuthState {
  status: "loading" | "ready" | "error";
  user: AuthUser | null;
  error: string | null;
}

const TelegramAuthContext = createContext<TelegramAuthState>({
  status: "loading",
  user: null,
  error: null,
});

export function useTelegramAuth() {
  return useContext(TelegramAuthContext);
}

const AUTH_TIMEOUT_MS = 5000;

export function TelegramAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TelegramAuthState>({
    status: "loading",
    user: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function authenticate() {
      const webApp = window.Telegram?.WebApp;

      if (!webApp) {
        // Distinguish "not opened from inside Telegram" (expected during
        // plain-browser dev) from an actual auth failure.
        if (!cancelled) {
          setState({
            status: "error",
            user: null,
            error: "Telegram WebApp SDK not found — open this app from Telegram.",
          });
        }
        return;
      }

      webApp.ready();
      webApp.expand();

      const initData = webApp.initData;
      if (!initData) {
        if (!cancelled) {
          setState({
            status: "error",
            user: null,
            error: "No initData available from Telegram.",
          });
        }
        return;
      }

      try {
        const res = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Auth request failed (${res.status})`);
        }

        const { user } = await res.json();
        if (!cancelled) {
          setState({ status: "ready", user, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            status: "error",
            user: null,
            error: err instanceof Error ? err.message : "Unknown auth error",
          });
        }
      }
    }

    const timeout = setTimeout(() => {
      if (!cancelled) {
        setState((prev) =>
          prev.status === "loading"
            ? { status: "error", user: null, error: "Auth timed out." }
            : prev
        );
      }
    }, AUTH_TIMEOUT_MS);

    authenticate();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  return (
    <TelegramAuthContext.Provider value={state}>
      {children}
    </TelegramAuthContext.Provider>
  );
}
