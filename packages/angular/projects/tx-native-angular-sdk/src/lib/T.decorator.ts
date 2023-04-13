import { Injector } from '@angular/core';

import { ITXInstanceConfiguration } from './interfaces';
import { TranslationService } from './translation.service';

/**
 * Decorator for transparently using the translation service as a property
 */
export const T = (
  str: string,
  params?: Record<string, unknown>,
  instanceConfig?: ITXInstanceConfiguration,
) => (target: object, key: string) => {
  const injector = Injector.create({
    providers: [ { provide: TranslationService, useClass: TranslationService } ],
  });
  const translationService = injector.get(TranslationService);

  Object.defineProperty(target, key, {
    configurable: false,
    get: () => {
      if (instanceConfig) {
        translationService.addInstance(instanceConfig);
      }
      return translationService.translate(str, { ...params }, instanceConfig?.alias ?? '');
    },
  });
};
