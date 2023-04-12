import { Injectable } from '@angular/core';
import { createNativeInstance, tx, TxNative } from '@transifex/native';
import { Observable, ReplaySubject } from 'rxjs';

import { ILanguage, ITranslationServiceConfig, ITXInstanceConfiguration } from './interfaces';

/**
 * Service which wraps the Transifex Native library for using inside components
 */
@Injectable({ providedIn: 'root' }) // Singleton Injection
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

  /**
   * Initializes the translation service
   */
  public async init(config: ITranslationServiceConfig) {
    const instance = this.getInstance(config.instanceAlias ?? '');
    instance.init(config);
    await this.getLanguages();
    const localeTags = instance.fetchedTags?.[instance.currentLocale] ?? [];
    const filterTags = config.filterTags;
    this.translationsFetchedSubject.next(filterTags !== undefined && localeTags.includes(filterTags));
  }

  /**
   * Sets the current locale
   */
  public async setCurrentLocale(locale: string, instanceAlias?: string) {
    const instance = this.getInstance(instanceAlias ?? '');
    await instance.setCurrentLocale(locale);
    this.localeChangedSubject.next(locale);
    const localeTags = instance.fetchedTags?.[instance.currentLocale] ?? [];
    this.translationsFetchedSubject.next(localeTags.includes(instance.filterTags));
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
      const txInstance = createNativeInstance({ token: config.token });

      if (config.controlled) {
        await tx.controllerOf(txInstance);
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
      await instance.fetchTranslations(instance.currentLocale, { filterTags: tags });
      const localeTags = instance.fetchedTags?.[instance.currentLocale] ?? [];
      this.translationsFetchedSubject.next(localeTags.includes(tags));
    } else {
      this.translationsFetchedSubject.next(true);
    }
  }
}
