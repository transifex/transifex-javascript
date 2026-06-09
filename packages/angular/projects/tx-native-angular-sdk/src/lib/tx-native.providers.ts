import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';

import { TranslationService } from './translation.service';

/**
 * Constructs the root {@link TranslationService} during application bootstrap so `@T`
 * property getters always resolve a registered instance, even when no component
 * injects `TranslationService` before the first `@T` read.
 *
 * - **NgModule:** included automatically by {@link TxNativeModule.forRoot}.
 * - **Standalone:** add to `bootstrapApplication(app, { providers: [ provideTxNativeEagerTranslationService(), ... ] })`.
 */
export function provideTxNativeEagerTranslationService(): EnvironmentProviders {
  return provideAppInitializer(() => {
    inject(TranslationService);
  });
}
