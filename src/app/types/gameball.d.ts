declare global {
  interface Window {
    GbLoadInit?: () => void;
  }
}

// We don't have public TS types from the CDN; keep it permissive:
declare const GbSdk: any;

export {};
