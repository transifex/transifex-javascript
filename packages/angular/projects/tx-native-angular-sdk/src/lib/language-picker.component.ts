import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { TXInstanceComponent } from './instance.component';
import { ILanguage } from './interfaces';
import { TranslationService } from './translation.service';

/**
 * A language picker component with the available languages already populated
 */
@Component({
  selector: 'ws-language-picker',
  template: `
    <select [class]="className" (change)="onChange($event)" class="ws-language-picker">
      <option
          *ngFor="let language of languages"
          [selected]="language.code === currentLocale"
          [value]="language.code"
      >
        {{ language.localized_name || language.name }}
      </option>
    </select>
  `,
  styles: [],
})
export class LanguagePickerComponent implements OnInit, OnDestroy {
  @Input() className = '';

  @Output() localeChanged: EventEmitter<string> = new EventEmitter<string>();

  languages: ILanguage[] = [];

  // The locale selected on the TX Native instance
  get currentLocale(): string {
    return this.getCurrentLocale();
  }

  // Current language picker WSNative instance
  get activeInstance(): string {
    return this.instance.alias || '';
  }

  // Observable for detecting instance readiness
  get instanceReady(): Observable<boolean> {
    return this.instance.instanceIsReady;
  }

  // Subscription to instance ready event to refresh languages
  instanceIsReadySubscription!: Subscription;

  constructor(
      public translationService: TranslationService,
      public instance: TXInstanceComponent,
  ) {
    this.getLanguages.bind(this);

    // When there is an alternative instance, listen to its readiness and retrieve the languages again
    // eslint-disable-next-line rxjs/no-async-subscribe
    this.instanceIsReadySubscription = this.instanceReady.subscribe(async (ready) => {
      if (ready) {
        this.languages = [];
        await this.getLanguages();
      }
    });
  }

  ngOnInit(): void {
    // Do not retrieve languages in the initialization if alternative instance found, will fetch languages
    // when the instance is ready using a subscription
    if (this.instance?.alias) {
      return;
    }

    this.getLanguages();
  }

  /**
   * Retrieves the available languages
   */
  async getLanguages() {
    this.languages = await this.translationService.getLanguages(this.activeInstance);
  }

  /**
   * Handles language selection changes
   */
  async onChange(event: Event) {
    const locale: string = (event.target as HTMLSelectElement).value;
    await this.translationService.setCurrentLocale(locale, this.activeInstance);
    this.localeChanged.emit(locale);
  }

  /**
   * Returns the current locale from the active instance
   */
  getCurrentLocale() {
    return this.translationService.getCurrentLocale(this.activeInstance);
  }

  /**
   * Component destruction
   */
  ngOnDestroy() {
    this.instanceIsReadySubscription.unsubscribe();
  }
}
