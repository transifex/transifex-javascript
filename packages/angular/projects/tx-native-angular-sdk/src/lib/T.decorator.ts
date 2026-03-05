import { getTranslationServiceForTDecorator } from './t-decorator-translation-bridge';
import { ITXInstanceConfiguration } from './interfaces';

/**
 * Resolves the app’s root {@link TranslationService} on each @T property read (lazy).
 *
 * Resolving here (not when the decorator runs on the class) avoids requiring a service
 * before `TestBed.inject` / bootstrap. Cannot use `Injector.create().get(TranslationService)`
 * in decorator setup (NG0203 on Angular 19+). The root service self-registers when Angular
 * constructs it (`useFactory`) and again in {@link TranslationService.init}.
 */
function getTranslationService() {
  return getTranslationServiceForTDecorator();
}

/**
 * Decorator for transparently using the translation service as a component property.
 */
export const T = (
  str: string,
  params?: Record<string, unknown>,
  instanceConfig?: ITXInstanceConfiguration,
) => (target: object, key: string) => {
  Object.defineProperty(target, key, {
    configurable: false,
    get: () => {
      const translationService = getTranslationService();
      if (instanceConfig) {
        translationService.addInstance(instanceConfig);
      }
      return translationService.translate(
        str,
        { ...params },
        (instanceConfig && instanceConfig.alias) || '',
      );
    },
  });
};
