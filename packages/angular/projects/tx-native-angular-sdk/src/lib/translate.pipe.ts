import { ChangeDetectorRef, Injectable, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';

import { TXInstanceComponent } from './instance.component';
import { TranslationService } from './translation.service';

@Injectable()
@Pipe({
  name: 'translate',
  pure: false, // required to update the translation
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  translation = '';

  lastStr = '';

  lastParams = {};

  onLocaleChange: Subscription | undefined;

  onTranslationsFetch: Subscription | undefined;

  /**
   * Constructor
   */
  constructor(
    protected translationService: TranslationService,
    private instance: TXInstanceComponent,
    private ref: ChangeDetectorRef,
  ) {}

  /**
   * Updates the translation in case of locale changed
   */
  updateTranslation(str: string, params: Record<string, unknown>): void {
    this.translation = this.translationService.translate(str, params, this.instance.alias);
    this.lastStr = str;
    this.lastParams = params;
    this.ref.markForCheck();
  }

  /**
   * Transforms str into a translated string.
   */
  transform(str: string, translateParams?: Record<string, unknown>): string {
    const params = translateParams ?? {};

    this.lastStr = str;
    this.lastParams = params;

    // if there is a subscription to onLocaleChange, clean it
    this.dispose();

    this.updateTranslation(str, params);

    // subscribe to localeChanged, in case the language changes
    if (!this.onLocaleChange) {
      this.onLocaleChange = this.translationService.localeChanged.subscribe(() => {
        this.updateTranslation(str, params);
      });
    }

    if (!this.onTranslationsFetch) {
      this.onTranslationsFetch = this.translationService.translationsFetched.subscribe(() => {
        this.updateTranslation(str, params);
      });
    }

    this.translation = this.translationService.translate(str, params, this.instance.alias);

    return this.translation;
  }

  /**
   * Clean any existing subscription to change events
   */
  private dispose(): void {
    if (this.onLocaleChange !== undefined) {
      this.onLocaleChange.unsubscribe();
      this.onLocaleChange = undefined;
    }
    if (this.onTranslationsFetch !== undefined) {
      this.onTranslationsFetch.unsubscribe();
      this.onTranslationsFetch = undefined;
    }
  }

  /**
   * Component destroy/dispose
   */
  ngOnDestroy(): void {
    this.dispose();
  }
}
