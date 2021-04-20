import { Injector } from '@angular/core';

import { TranslationService } from './translation.service';

/**
 * Decorator for using transparently the translation service as a property
 */
export const T = (str: string, params: Record<string, unknown>) => (target: any, key: string) => {
  const injector = Injector.create(
    {
      providers: [{ provide: TranslationService, useClass: TranslationService }],
    },
  );
  const translationService = injector.get(TranslationService);

  Object.defineProperty(target, key, {
    configurable: false,
    get: () => translationService.translate(str, params),
  });
};
