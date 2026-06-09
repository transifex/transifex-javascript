import type { TranslationService } from './translation.service';

/**
 * Binds the root TranslationService for the `T` property decorator getters.
 *
 * CONSTRAINT — client-only, single root app:
 * A property decorator getter has no Angular injection context, so it cannot
 * resolve `TranslationService` per-injector. This module-scoped reference is the
 * only non-DI escape hatch and is therefore shared process-wide. It assumes a
 * single root `TranslationService` per process and is NOT safe for server-side
 * rendering (Angular Universal) or multiple bootstrapped apps / micro-frontends
 * on one page, where concurrent requests/apps would overwrite this reference for
 * each other.
 *
 * Note this is not a new limitation introduced here: the default instance is
 * backed by the global `tx` singleton from `@transifex/native` (whose
 * `currentLocale` and cache are already process-global), so per-request
 * isolation is not achievable for the default instance regardless.
 *
 * For SSR or multi-app setups, prefer the DI-based primitives, which resolve the
 * correct service per-injector: the `T`/`UT` components, the `translate` pipe, or
 * injecting `TranslationService` directly.
 */
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
