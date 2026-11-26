import { isPlatformServer } from '@angular/common';
import { Injectable, PendingTasks, PLATFORM_ID } from '@angular/core';
import { createNativeInstance, tx, TxNative } from '@transifex/native';
import { Observable, ReplaySubject } from 'rxjs';

import { injectIfAvailable } from './inject-if-available';
import { ILanguage, ITranslationServiceConfig, ITXInstanceConfiguration } from './interfaces';
import { registerRootTranslationServiceForTDecorator } from './t-decorator-translation-bridge';

/**
 * Resolves Angular's {@link PendingTasks} only when rendering on the server.
 *
 * On the server, SDK requests must hold back rendering until translations arrive. In the
 * browser the SDK does not touch app stability at all, so client apps behave as before.
 */
function injectServerPendingTasks(): PendingTasks | undefined {
  const platformId = injectIfAvailable(PLATFORM_ID);
  if (!platformId || !isPlatformServer(platformId)) {
    return undefined;
  }
  return injectIfAvailable(PendingTasks);
}

function translationServiceRootFactory(): TranslationService {
  const service = new TranslationService();
  registerRootTranslationServiceForTDecorator(service);
  return service;
}

/**
 * Service which wraps the Transifex Native library for using inside components
 */
@Injectable({ providedIn: 'root', useFactory: translationServiceRootFactory }) // Singleton Injection
export class TranslationService {
  // Observables for detecting locale change
  get localeChanged(): Observable<string> {
    return this.localeChangedSubject;
  }

  // Observables for detecting translations fetching
  get translationsFetched(): Observable<boolean> {
    return this.translationsFetchedSubject;
  }

  // A dictionary with additional TX Native instances for translation
  private additionalInstances: { [id: string]: TxNative } = {};

  // A subject for managing locale changes
  private localeChangedSubject = new ReplaySubject<string>(0);

  // A subject for managing the lazy loading of translations
  private translationsFetchedSubject = new ReplaySubject<boolean>(0);

  // Server only: keeps the app "unstable" while the SDK talks to the CDS, so SSR waits for
  // translations before rendering the page (Native does not use HttpClient).
  private readonly serverPendingTasks = injectServerPendingTasks();

  /**
   * Initializes the translation service
   */
  public async init(config: ITranslationServiceConfig) {
    registerRootTranslationServiceForTDecorator(this);
    await this.whilePending(async () => {
      const instance = this.getInstance(config.instanceAlias ?? '');
      instance.init(config);
      await this.getLanguages();
      this.notifyTranslationsFetched(instance, config.filterTags);
    });
  }

  /**
   * Sets the current locale
   */
  public async setCurrentLocale(locale: string, instanceAlias?: string) {
    await this.whilePending(async () => {
      const instance = this.getInstance(instanceAlias ?? '');
      await instance.setCurrentLocale(locale);
      this.localeChangedSubject.next(locale);
      this.notifyTranslationsFetched(instance, instance.filterTags);
    });
  }

  /**
   * Gets the current locale
   */
  public getCurrentLocale(instanceAlias?: string): string {
    const instance = this.getInstance(instanceAlias ?? '');
    return instance.getCurrentLocale() ?? '';
  }

  /**
   * Gets the languages collection
   */
  public async getLanguages(instanceAlias?: string): Promise<ILanguage[]> {
    const instance = this.getInstance(instanceAlias ?? '');
    return instance.getLanguages();
  }

  /**
   * Translate a string
   */
  public translate(str: string, params: Record<string, unknown>, instanceAlias?: string): string {
    const instance = this.getInstance(instanceAlias ?? '');
    return instance.translate(str, params);
  }

  /**
   * Adds a new TX Native instance for alternative resource translations
   */
  public async addInstance(config: ITXInstanceConfiguration): Promise<boolean> {
    if (!config.token || !config.alias) {
      return false;
    }

    if (this.additionalInstances[config.alias]) {
      return true;
    }

    try {
      const txInstance = createNativeInstance({
        token: config.token,
        ...(config.cdsHost ? { cdsHost: config.cdsHost } : {}),
      });

      if (config.controlled) {
        await this.whilePending(() => tx.controllerOf(txInstance));
      }

      this.additionalInstances[config.alias] = txInstance;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retrieves the instance that matches the given alias or the default one if the alias does not match
   */
  public getInstance(instanceAlias?: string): TxNative {
    return instanceAlias ? this.additionalInstances[instanceAlias] ?? tx : tx;
  }

  /**
   * Retrieves the tagged translations from the given instance or from the default one
   */
  public async fetchTranslations(tags: string, instanceAlias?: string): Promise<void> {
    const instance = this.getInstance(instanceAlias);
    if (instance.currentLocale) {
      await this.whilePending(async () => {
        await instance.fetchTranslations(instance.currentLocale, { filterTags: tags });
        this.notifyTranslationsFetched(instance, tags);
      });
    } else {
      this.translationsFetchedSubject.next(true);
    }
  }

  /**
   * Emits whether the given tags are loaded for the instance's current locale.
   */
  private notifyTranslationsFetched(instance: TxNative, tags: string | undefined): void {
    const localeTags = instance.fetchedTags?.[instance.currentLocale] ?? [];
    this.translationsFetchedSubject.next(tags !== undefined && localeTags.includes(tags));
  }

  /**
   * On the server, runs async SDK work as an Angular pending task so rendering waits for it.
   * In the browser it just runs the work. Uses `add()`, whose signature is the same on Angular 19-22.
   */
  private async whilePending<R>(work: () => Promise<R>): Promise<R> {
    const removeTask = this.serverPendingTasks?.add();
    try {
      return await work();
    } finally {
      removeTask?.();
    }
  }
}
