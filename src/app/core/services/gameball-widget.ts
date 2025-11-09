import { DOCUMENT, Inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    GbSdk?: { init: (config: any) => void };
    GbLoadInit?: () => void;
  }
}

interface GameballPlayerAttributes {
  displayName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  gender?: 'M' | 'F';
  dateOfBirth?: string; // ISO yyyy-MM-dd
  joinDate?: string; // ISO yyyy-MM-dd
  custom?: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class GameballWidget {
  private scriptLoaded = false;
  private scriptLoadingPromise: Promise<void> | null = null;
  private initializedForUserId: string | null = null;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  /**
   * Loads the Gameball widget script only once. Ensures we define GbLoadInit prior to loading so SDK can auto-init.
   */
  private loadScriptOnce(): Promise<void> {
    if (this.scriptLoaded) return Promise.resolve();
    if (this.scriptLoadingPromise) return this.scriptLoadingPromise;

    this.scriptLoadingPromise = new Promise<void>((resolve, reject) => {
      // If SDK already available (script loaded elsewhere), short-circuit
      if (typeof window !== 'undefined' && window.GbSdk) {
        this.scriptLoaded = true;
        resolve();
        return;
      }
      const existing = this.document.querySelector(
        'script[src*="assets.gameball.co/widget/js/gameball-init.min.js"]'
      ) as HTMLScriptElement | null;
      if (existing) {
        // If script tag is already present
        if (window.GbSdk || (existing as any)._gbLoaded) {
          this.scriptLoaded = true;
          resolve();
        } else {
          existing.addEventListener('load', () => {
            (existing as any)._gbLoaded = true;
            this.scriptLoaded = true;
            resolve();
          });
          existing.addEventListener('error', () =>
            reject(new Error('Gameball script failed to load'))
          );
        }
        return;
      }

      const script = this.document.createElement('script');
      script.src = 'https://assets.gameball.co/widget/js/gameball-init.min.js';
      script.defer = true;
      script.async = true;
      script.addEventListener('load', () => {
        (script as any)._gbLoaded = true;
        this.scriptLoaded = true;
        resolve();
        // In case GbSdk loaded before our GbLoadInit assignment was effective
        this.invokeInitIfReady();
      });
      script.addEventListener('error', () => reject(new Error('Gameball script failed to load')));
      (this.document.body || this.document.head).appendChild(script);
    });

    return this.scriptLoadingPromise;
  }

  /** Initialize widget for guests (no playerUniqueId). */
  initGuest(): void {
    if (!environment.showGameballForGuests) return; // Feature flag
    // Don't override a customer view; guests only if no user
    if (this.initializedForUserId) return;

    this.defineLoaderFunction({
      playerUniqueId: '',
      playerAttributes: {},
    });
    this.loadScriptOnce().catch(console.error);
    this.invokeInitIfReady();
  }

  /** Initialize / re-initialize widget for a logged-in customer. */
  initCustomer(userId: string, attrs: GameballPlayerAttributes = {}): void {
    if (!userId) return;
    if (this.initializedForUserId === userId) return; // already initialized with same user

    this.initializedForUserId = userId;
    this.defineLoaderFunction({
      playerUniqueId: userId,
      playerAttributes: attrs,
    });
    this.loadScriptOnce().catch(console.error);
    this.invokeInitIfReady();
  }

  /** Clears current user context and falls back to guest view (if allowed). */
  resetToGuest(): void {
    this.initializedForUserId = null;
    this.initGuest();
  }

  /** Assigns window.GbLoadInit so Gameball script auto-invokes or we can invoke manually. */
  private defineLoaderFunction(overrides: {
    playerUniqueId: string;
    playerAttributes: GameballPlayerAttributes;
  }) {
    const baseConfig = {
      APIKey: environment.gameballPublicKey,
      lang: environment.gameballLang,
      playerUniqueId: overrides.playerUniqueId,
      playerAttributes: overrides.playerAttributes ?? {},
      onWidgetOpen: () => {
        // Hook point for future analytics
        // console.log('[Gameball] Widget opened');
      },
      onWidgetClose: () => {
        // Hook point for future analytics
        // console.log('[Gameball] Widget closed');
      },
    };
    window.GbLoadInit = () => {
      if (!window.GbSdk) return; // Will be retried via invokeInitIfReady once SDK exists
      window.GbSdk.init(baseConfig);
    };
  }

  /** Calls GbLoadInit if both script + GbSdk are available. */
  private invokeInitIfReady() {
    if (window.GbSdk && window.GbLoadInit) {
      try {
        window.GbLoadInit();
      } catch (e) {
        console.error('[Gameball] init error', e);
      }
    }
  }
}
