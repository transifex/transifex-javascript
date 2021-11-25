import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { tx } from '@transifex/native';

import { ILanguage, ITranslationServiceConfig } from './interfaces';


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

  private localeChangedSubject = new ReplaySubject<string>(0);

  /**
   * Initializes the translation service
   *
   * @param config
   * @returns void
   */
  public async init(config: ITranslationServiceConfig) {
    tx.init(config);
    await this.getLanguages();
  }

  /**
   * Sets the current locale
   *
   * @param locale
   * @returns void
   */
  public async setCurrentLocale(locale: string) {
    await tx.setCurrentLocale(locale);
    this.localeChangedSubject.next(locale);
  }

  /**
   * Gets the current locale
   *
   * @returns string
   */
  public getCurrentLocale(): string {
    return tx.getCurrentLocale() || '';
  }

  /**
   * Gets the languages collection
   *
   * @returns any
   */
  public async getLanguages(): Promise<ILanguage[]> {
    return tx.getLanguages();
  }

  /**
   * Translate a string
   *
   * @param str
   * @param params
   * @returns void
   */
  public translate(str: string, params: Record<string, unknown>): string {
    return tx.translate(str, params);
  }
}
