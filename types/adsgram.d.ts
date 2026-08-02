export {};

declare global {
  interface AdsgramShowResult {
    done: boolean;
    description: string;
    state: "load" | "render" | "playing" | "destroy";
    error: boolean;
  }

  interface AdsgramController {
    show(): Promise<AdsgramShowResult>;
  }

  interface Window {
    Adsgram?: {
      init(params: { blockId: string; debug?: boolean }): AdsgramController;
    };
  }
}