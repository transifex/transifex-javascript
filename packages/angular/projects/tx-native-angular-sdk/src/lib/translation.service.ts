import { Injectable } from '@angular/core';
import { createNativeInstance, tx } from '@transifex/native';
import { Observable, ReplaySubject } from 'rxjs';

import { ILanguage, ITranslationServiceConfig, ITXInstanceConfiguration } from './interfaces';


/** Singleton Injection */
@Injectable({
  providedIn: 'root',
})

/**
 * Service which wraps the Transifex Native library for using
 * inside components
 */
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
  private additionalInstances: { [id: string]: any } = {};

  // A subject for managing locale changes
  private localeChangedSubject = new ReplaySubject<string>(0);

  // A subject for managing the lazy loading of translations
  private translationsFetchedSubject = new ReplaySubject<boolean>(0);

  /**
   * Initializes the translation service
   *
   * @param config
   * @param instanceAlias
   * @returns void
   */
  public async init(config: ITranslationServiceConfig) {
    const instance = this.getInstance(config.instanceAlias || '');
    instance.init(config);
    await this.getLanguages();
    this.translationsFetchedSubject.next(
      (instance.fetchedTags &&
        instance.fetchedTags[instance.currentLocale] || []).
        indexOf(config.filterTags) !== -1,
    );
  }

  /**
   * Sets the current locale
   *
   * @param locale
   * @param instanceAlias
   * @returns void
   */
  public async setCurrentLocale(locale: string, instanceAlias?: string) {
    const instance = this.getInstance(instanceAlias || '');
    await instance.setCurrentLocale(locale);
    this.localeChangedSubject.next(locale);
    this.translationsFetchedSubject.next(
      (instance.fetchedTags &&
        instance.fetchedTags[instance.currentLocale] || []).
        indexOf(instance.filterTags) !== -1,
    );
  }

  /**
   * Gets the current locale
   *
   * @param instanceAlias
   * @returns string
   */
  public getCurrentLocale(instanceAlias?: string): string {
    const instance = this.getInstance(instanceAlias || '');
    return instance.getCurrentLocale() || '';
  }

  /**
   * Gets the languages collection
   *
   * @param instanceAlias
   * @returns any
   */
  public async getLanguages(instanceAlias?: string): Promise<ILanguage[]> {
    const instance = this.getInstance(instanceAlias || '');
    return instance.getLanguages();
  }

  /**
   * Translate a string
   *
   * @param str
   * @param params
   * @param instanceAlias
   * @returns void
   */
  public translate(str: string, params: Record<string, unknown>,
    instanceAlias?: string): string {
    const instance = this.getInstance(instanceAlias || '');
    return instance.translate(str, params);
  }

  /**
   * Adds a new TX Native instance for alternative resource translations
   *
   * @param config
   * @returns boolean
   */
  public async addInstance(config: ITXInstanceConfiguration): Promise<boolean> {
    if (!config.token || !config.alias) {
      return false;
    }
    try {
      if (this.additionalInstances[config.alias]) {
        return true;
      }
      const txInstance = createNativeInstance({
        token: config.token,
      });
      if (txInstance) {
        if (config.controlled) {
          await tx.controllerOf(txInstance);
        }
        this.additionalInstances[config.alias] = txInstance;
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Retrieves the instance that matches the given alias or the default one
   * if the alias does not match
   *
   * @param instanceAlias
   * @returns TXNative instance
   */
  public getInstance(instanceAlias?: string): any {
    let instance = tx; // Fallback to TX Native main instance

    try {
      if (instanceAlias && this.additionalInstances[instanceAlias]) {
        instance = this.additionalInstances[instanceAlias];
      }
    } catch (e) {}

    return instance;
  }

  /**
   * Retrieves the tagged translations from the given instance
   * or from the default one
   *
   * @param tags
   * @param instanceAlias
   * @returns Promise<any>
   */
  public async fetchTranslations(tags: string, instanceAlias?: string): Promise<any> {
    const instance = this.getInstance(instanceAlias);
    if (instance && instance.currentLocale) {
      await instance.fetchTranslations(instance.currentLocale, { filterTags: tags });
      this.translationsFetchedSubject.next(
        (instance && instance.fetchedTags && instance.fetchedTags[instance.currentLocale] || []).
          indexOf(tags) !== -1,
      );
    } else {
      this.translationsFetchedSubject.next(true);
    }
  }
}
