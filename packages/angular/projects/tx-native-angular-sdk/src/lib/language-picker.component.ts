import {
  Component, EventEmitter, Input, OnInit, Output,
} from '@angular/core';

import { ILanguage } from './interfaces';
import { TranslationService } from './translation.service';

@Component({
  selector: 'tx-language-picker',
  template: `
      <select [class]="className" (change)="onChange($event)" class="tx-language-picker">
      <option *ngFor="let language of languages" [selected]="language.code === translationService.getCurrentLocale()" [value]="language.code">
      {{ language.localized_name || language.name }}
      </option>
    </select>`,
  styles: [],
})

/**
 * A language picker component with the available languages
 * already populated
 */
export class LanguagePickerComponent implements OnInit {
  @Input()
  className = '';

  @Output()
  localeChanged: EventEmitter<string> = new EventEmitter<string>();

  languages: ILanguage[] = [];

  /**
   * Constructor
   *
   * @param translationService
   */
  constructor(public translationService: TranslationService) {
    this.getLanguages.bind(this);
  }

  ngOnInit(): void {
    this.getLanguages();
  }

  /**
   * Retrieves the available languages
   *
   * @param translationService
   */
  async getLanguages() {
    this.languages = await this.translationService.getLanguages();
  }

  /**
   * Handles language selection changes
   *
   * @param event
   */
  async onChange(event: Event) {
    const locale: string = (event.target as HTMLSelectElement).value;
    await this.translationService.setCurrentLocale(locale);
    this.localeChanged.emit(locale);
  }
}
