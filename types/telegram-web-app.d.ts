export {};

declare global {
  interface TelegramWebAppUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
  }

  interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
      user?: TelegramWebAppUser;
      start_param?: string;
      [key: string]: unknown;
    };
    colorScheme: "light" | "dark";
    themeParams: Record<string, string>;
    ready: () => void;
    expand: () => void;
    close: () => void;
    requestFullscreen?: () => void;
    exitFullscreen?: () => void;
    disableVerticalSwipes?: () => void;
    enableVerticalSwipes?: () => void;
    onEvent: (eventType: string, callback: () => void) => void;
    offEvent: (eventType: string, callback: () => void) => void;
  }

  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}