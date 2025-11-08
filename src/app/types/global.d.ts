declare global {
  interface Window {
    GbSdk?: {
      init(config: {
        APIKey: string;
        lang?: string;
        playerUniqueId?: string;
        playerAttributes?: Record<string, unknown>;
        onWidgetOpen?: () => void;
        onWidgetClose?: () => void;
      }): void;
    };
  }
}
export {};
