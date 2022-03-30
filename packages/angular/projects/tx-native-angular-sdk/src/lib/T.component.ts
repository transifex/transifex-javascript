import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { TXInstanceComponent } from './instance.component';
import { ITranslateParams } from './interfaces';
import { TranslationService } from './translation.service';

@Component({
  selector: 'T',
  template: `
    <ng-container *ngIf="!translateParams.sanitize">{{ translatedStr }}</ng-container>
    <span *ngIf="translateParams.sanitize" [innerHTML]="translatedStr | safeHtml"></span>
  `,
  styles: [],
})

/**
 * A translation component
 *
 * @param {string} str
 * @param {string=} key
 * @param {string=} context
 * @param {string=} comment
 * @param {number=} charlimit
 * @param {string=} tags
 * @param {boolean=} escapeVars
 * @param {boolean=} inline
 * @param {boolean=} sanitize
 * @param {Object=} vars
 */
export class TComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
    str = '';

  @Input()
    key?: string = '';

  @Input()
    context?: string = '';

  @Input()
    comment?: string = '';

  @Input()
    charlimit?: number = 0;

  @Input()
    tags?: string = '';

  @Input()
    escapeVars?: boolean = false;

  @Input()
    inline?: boolean = false;

  @Input()
    sanitize?: boolean = false;

  @Input()
  get vars(): Record<string, unknown> {
    return this.actualVars;
  }

  set vars(v: Record<string, unknown>) {
    this.actualVars = { ...v };
  }

  get translateParams(): ITranslateParams {
    return {
      _key: this.key,
      _context: this.context,
      _comment: this.comment,
      _charlimit: this.charlimit,
      _tags: this.tags,
      _escapeVars: this.escapeVars,
      _inline: this.inline,
      sanitize: this.sanitize,
    };
  }

  translatedStr = '';

  // Observable for detecting locale changes
  get localeChanged(): Observable<string> {
    return this.translationService.localeChanged;
  }

  onLocaleChange: Subscription | undefined;

  onTranslationsFetch: Subscription | undefined;

  private actualVars: Record<string, unknown> = {};

  /**
   * Constructor
   *
   * @param translationService
   * @param instance
   */
  constructor(protected translationService: TranslationService,
    protected instance: TXInstanceComponent) {
    this.onLocaleChange = this.localeChanged.subscribe(
      () => {
        this.translate();
      },
    );
    this.onTranslationsFetch =
      this.translationService.translationsFetched.subscribe(
        () => {
          this.translate();
        },
      );
  }

  /**
   * Component initialization
   */
  ngOnInit() {
    this.translate();
  }

  /**
   * Component destruction
   */
  ngOnDestroy() {
    if (typeof this.onLocaleChange !== 'undefined') {
      this.onLocaleChange.unsubscribe();
      this.onLocaleChange = undefined;
    }
    if (typeof this.onTranslationsFetch !== 'undefined') {
      this.onTranslationsFetch.unsubscribe();
      this.onTranslationsFetch = undefined;
    }
  }

  /**
   * Input parameters change detector
   *
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges) {
    this.translate();
  }

  /**
   * Translate a string using the translation service
   */
  translate() {
    this.translatedStr = this.translationService.translate(this.str,
      { ...this.translateParams, ...this.vars }, this.instance.alias || '');
  }
}
