import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';

import { TxInstanceContext } from './tx-instance-context';
import { ILanguage } from './interfaces';
import { TranslationService } from './translation.service';

/**
 * A language picker component with the available languages already populated.
 */
@Component({
  standalone: true,
  selector: 'tx-language-picker',
  imports: [CommonModule],
  template: `
    <select [class]="className" (change)="onChange($event)" class="tx-language-picker">
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

  get currentLocale(): string {
    return this.getCurrentLocale();
  }

  get activeInstance(): string {
    return this.txContext.alias || '';
  }

  get instanceReady(): Observable<boolean> {
    return this.txContext.instanceIsReady;
  }

  instanceIsReadySubscription!: Subscription;

  constructor(
    public translationService: TranslationService,
    public txContext: TxInstanceContext,
  ) {
    this.getLanguages.bind(this);
    // eslint-disable-next-line rxjs/no-async-subscribe
    this.instanceIsReadySubscription = this.instanceReady.subscribe(async (ready) => {
      if (ready) {
        this.languages = [];
        await this.getLanguages();
      }
    });
  }

  ngOnInit(): void {
    if (this.txContext?.alias) {
      return;
    }
    this.getLanguages();
  }

  async getLanguages() {
    this.languages = await this.translationService.getLanguages(this.activeInstance);
  }

  async onChange(event: Event) {
    const locale: string = (event.target as HTMLSelectElement).value;
    await this.translationService.setCurrentLocale(locale, this.activeInstance);
    this.localeChanged.emit(locale);
  }

  getCurrentLocale() {
    return this.translationService.getCurrentLocale(this.activeInstance);
  }

  ngOnDestroy() {
    this.instanceIsReadySubscription.unsubscribe();
  }
}
