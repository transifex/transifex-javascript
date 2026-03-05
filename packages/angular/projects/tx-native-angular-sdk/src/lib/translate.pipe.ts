import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';

import { TxInstanceContext } from './tx-instance-context';
import { TranslationService } from './translation.service';

@Pipe({
  standalone: true,
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  translation = '';
  lastStr = '';
  lastParams = {};

  onLocaleChange: Subscription | undefined;
  onTranslationsFetch: Subscription | undefined;

  constructor(
    protected translationService: TranslationService,
    private instance: TxInstanceContext,
    private ref: ChangeDetectorRef,
  ) {}

  updateTranslation(str: string, params: Record<string, unknown>): void {
    this.translation = this.translationService.translate(str, params, this.instance.alias);
    this.lastStr = str;
    this.lastParams = params;
    this.ref.markForCheck();
  }

  transform(str: string, translateParams?: Record<string, unknown>): string {
    const params = translateParams ?? {};

    this.lastStr = str;
    this.lastParams = params;

    this.dispose();

    this.updateTranslation(str, params);

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

  private dispose(): void {
    this.onLocaleChange?.unsubscribe();
    this.onLocaleChange = undefined;
    this.onTranslationsFetch?.unsubscribe();
    this.onTranslationsFetch = undefined;
  }

  ngOnDestroy(): void {
    this.dispose();
  }
}
