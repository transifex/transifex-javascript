import type { TranslationService } from './translation.service';

/** Binds the root TranslationService for the `T` property decorator getters. */
let translationServiceForTDecorator: TranslationService | undefined;

export function getTranslationServiceForTDecorator(): TranslationService {
  if (!translationServiceForTDecorator) {
    throw new Error(
      '@transifex/angular: @T was evaluated before any TranslationService existed. '
        + 'Use `TxNativeModule.forRoot()`, add `provideTxNativeEagerTranslationService()` '
        + 'to your `bootstrapApplication` providers, inject `TranslationService` during '
        + 'bootstrap, or call `translationService.init()` before components read @T properties.',
    );
  }
  return translationServiceForTDecorator;
}

export function registerRootTranslationServiceForTDecorator(
  service: TranslationService,
): void {
  translationServiceForTDecorator = service;
}
