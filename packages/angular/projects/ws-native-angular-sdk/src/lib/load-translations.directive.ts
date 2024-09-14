import { Directive, Input, OnChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { TranslationService } from './translation.service';

/**
 * Directive for fetching translations in batches
 */
@Directive({ selector: '[wsLoadTranslations]' })
export class LoadTranslationsDirective implements OnChanges, OnDestroy {
  @Input('wsLoadTranslations') tags = '';

  @Input() instanceAlias = '';

  onLocaleChange: Subscription | undefined;

  constructor(private translationService: TranslationService) {
    // eslint-disable-next-line rxjs/no-async-subscribe
    this.onLocaleChange = this.translationService.localeChanged.subscribe(async () => {
      await this.updateTranslation();
    });
  }

  /**
   * On changes detected retrieve again the translations
   */
  async ngOnChanges() {
    await this.updateTranslation();
  }

  /**
   * Retrieve the translations tagged with given tags
   */
  async updateTranslation() {
    await this.translationService.fetchTranslations(this.tags, this.instanceAlias);
  }

  /**
   * Clean any existing subscription to change events
   */
  ngOnDestroy() {
    if (this.onLocaleChange !== undefined) {
      this.onLocaleChange.unsubscribe();
      this.onLocaleChange = undefined;
    }
  }
}
