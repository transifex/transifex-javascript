import { inject, ProviderToken } from '@angular/core';

/**
 * Resolves `token` when called from an Angular injection context, and returns `undefined`
 * otherwise instead of throwing NG0203.
 *
 * SDK classes use this for dependencies added after their public constructors were defined,
 * so code that creates them with `new` (for example in unit tests or subclasses) keeps working.
 */
export function injectIfAvailable<T>(token: ProviderToken<T>): T | undefined {
  try {
    return inject(token, { optional: true }) ?? undefined;
  } catch {
    return undefined;
  }
}
