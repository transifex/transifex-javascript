import { getTranslationServiceForTDecorator } from './t-decorator-translation-bridge';
import { ITXInstanceConfiguration } from './interfaces';

/**
 * Resolves the app’s root {@link TranslationService} on each {@link T} property read (lazy).
 *
 * Resolving here (not when the decorator runs on the class) avoids requiring a service
 * before `TestBed.inject` / bootstrap. Cannot use `Injector.create().get(TranslationService)`
 * in decorator setup (NG0203 on Angular 19+). The root service self-registers when Angular
 * constructs it (`useFactory`) and again in {@link TranslationService.init}.
 */
function getTranslationService() {
  return getTranslationServiceForTDecorator();
}

/** Setter for `accessor` fields: the value always comes from the translation service. */
function ignoreAssignment(): void {
  // intentionally empty
}

/**
 * Decorator for transparently using the translation service as a component property.
 *
 * Works on a plain field when `useDefineForClassFields` is `false`:
 *
 * ```ts
 * @T('Hello') title!: string;
 * ```
 *
 * With TypeScript's default for `target: ES2022`+ (`useDefineForClassFields: true`, the
 * default in new Angular 20+ projects), a plain field becomes an own instance property that
 * hides the getter, so the value is always empty. Use an `accessor` field instead, which
 * works with either setting:
 *
 * ```ts
 * @T('Hello') accessor title!: string;
 * ```
 */
export const T = (
  str: string,
  params?: Record<string, unknown>,
  instanceConfig?: ITXInstanceConfiguration,
) => {
  const getTranslation = () => {
    const translationService = getTranslationService();
    if (instanceConfig) {
      translationService.addInstance(instanceConfig);
    }
    return translationService.translate(
      str,
      { ...params },
      (instanceConfig && instanceConfig.alias) || '',
    );
  };

  return (
    target: object,
    key: string,
    accessorDescriptor?: PropertyDescriptor,
    // Legacy (experimentalDecorators) property decorators must be typed `void` or `any`.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any => {
    if (accessorDescriptor) {
      // `accessor` field: replace the generated getter/setter pair.
      return {
        configurable: true,
        enumerable: accessorDescriptor.enumerable,
        get: getTranslation,
        set: ignoreAssignment,
      };
    }

    Object.defineProperty(target, key, {
      configurable: false,
      get: getTranslation,
    });
    return undefined;
  };
};
