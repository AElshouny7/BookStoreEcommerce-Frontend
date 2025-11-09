import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GameballWidget {
  private sdkLoaded = false;
  private sdkLoading?: Promise<void>;
  private currentLang = environment.gameball.lang ?? 'en';

  // Expose open/close events to the app (wired to callbacks)
  readonly widgetOpen$ = new BehaviorSubject<boolean>(false);
  readonly widgetClose$ = new BehaviorSubject<boolean>(true);

  /** Ensure the SDK script is injected only once */
  private loadSdk(): Promise<void> {
    if (this.sdkLoaded) return Promise.resolve();
    if (this.sdkLoading) return this.sdkLoading;

    this.sdkLoading = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(
        'script[src="https://assets.gameball.co/widget/js/gameball-init.min.js"]'
      ) as HTMLScriptElement | null;

      if (existing) {
        existing.addEventListener('load', () => {
          this.sdkLoaded = true;
          resolve();
        });
        existing.addEventListener('error', (e) => reject(e));
        return;
      }

      // Define the global init shim that CDN will call automatically
      (window as any).GbLoadInit = () => {
        this.sdkLoaded = true;
        resolve();
      };

      const s = document.createElement('script');
      s.src = 'https://assets.gameball.co/widget/js/gameball-init.min.js';
      s.defer = true;
      s.onerror = (e) => reject(e);
      document.body.appendChild(s);
    });

    return this.sdkLoading;
  }

  /** Generic init - used by guest/customer init */
  private async init(config: {
    publicKey?: string;
    lang?: string;
    playerUniqueId?: string;
    playerAttributes?: Record<string, any>;
  }) {
    await this.loadSdk();

    const APIKey = config.publicKey ?? environment.gameball.publicKey;
    const lang = config.lang ?? this.currentLang;

    // Defensive: if GbSdk is not yet on window (rare), wait one microtask
    const tryInit = () =>
      new Promise<void>((resolve) => {
        Promise.resolve().then(() => {
          (window as any).GbLoadInit = undefined; // not needed after first load
          // Re-init is safe; SDK should handle mounted state internally
          (globalThis as any).GbSdk?.init({
            APIKey,
            lang,
            playerUniqueId: config.playerUniqueId ?? '',
            playerAttributes: config.playerAttributes ?? {},
            onWidgetOpen: () => this.widgetOpen$.next(true),
            onWidgetClose: () => this.widgetClose$.next(true),
          });
          resolve();
        });
      });

    await tryInit();
  }

  /** Guest view (no player) */
  initGuest(lang?: string) {
    this.currentLang = lang ?? this.currentLang;
    return this.init({ lang: this.currentLang });
  }

  /** Customer view with required playerUniqueId */
  initCustomer(playerUniqueId: string, playerAttributes?: Record<string, any>, lang?: string) {
    this.currentLang = lang ?? this.currentLang;
    return this.init({
      lang: this.currentLang,
      playerUniqueId,
      playerAttributes,
    });
  }

  /** Switch widget language on the fly (re-init with same mode) */
  async setLanguage(lang: string, currentUser?: { id: string; attributes?: any }) {
    this.currentLang = lang;
    if (currentUser?.id) {
      await this.initCustomer(currentUser.id, currentUser.attributes, lang);
    } else {
      await this.initGuest(lang);
    }
  }
}
