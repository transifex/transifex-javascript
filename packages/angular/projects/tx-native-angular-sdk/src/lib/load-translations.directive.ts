import { Directive, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';

import { TranslationService } from './translation.service';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[txLoadTranslations]',
})

/**
 * Directive for fetching translations in batches
 *
 * @param {string=} tags
 * @param {string=} instanceAlias
 */
export class LoadTranslationsDirective implements OnChanges, OnDestroy {
  @Input('txLoadTranslations') tags = '';

  @Input() instanceAlias = '';

  onLocaleChange: Subscription | undefined;

  /**
   * Constructor
   *
   * @param translationService
   */
  constructor(private translationService: TranslationService) {
    this.onLocaleChange = this.translationService.localeChanged.subscribe(
      async (locale: string) => {
        await this.updateTranslation();
      });
  }

  /**
   * On changes detected retrieve again the translations
   */
  async ngOnChanges(changes: SimpleChanges) {
    await this.updateTranslation();
  }

  /**
   * Retrieve the translations tagged with given tags
   */
  async updateTranslation() {
    await this.translationService.fetchTranslations(
      this.tags,
      this.instanceAlias,
    );
  }

  /**
   * Clean any existing subscription to change events
   */
  ngOnDestroy() {
    if (typeof this.onLocaleChange !== 'undefined') {
      this.onLocaleChange.unsubscribe();
      this.onLocaleChange = undefined;
    }
  }
}
