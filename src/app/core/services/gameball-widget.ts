import { DOCUMENT, Inject, Injectable, INJECTOR } from '@angular/core';

// type Maybeuser = {
//   id:
// }

@Injectable({
  providedIn: 'root',
})
export class GameballWidget {
  private scriptLoaded = false;
  private scriptLoadingPromise: Promise<void> | null = null;
  private initializedForUserId: string | null = null;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  private loadScriptOnce(): Promise<void> {
    if (this.scriptLoaded) return Promise.resolve();
    if (this.scriptLoadingPromise) return this.scriptLoadingPromise;

    this.scriptLoadingPromise = new Promise<void>((resolve) => {
      const existing = this.document.querySelector(
        'script[src*="assets.gameball.co/widget/js/gameball-init.min.js"]'
      );
      if (existing) {
        this.scriptLoaded = true;
        resolve();
        return;
      }
    });

    return this.scriptLoadingPromise;
  }


}
