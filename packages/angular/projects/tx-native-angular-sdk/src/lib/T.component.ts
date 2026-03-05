import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';

import { TxInstanceContext } from './tx-instance-context';
import { ITranslateParams } from './interfaces';
import { TranslationService } from './translation.service';

/**
 * A translation component.
 *
 * Uses DomSanitizer directly (injected via constructor) instead of SafeHtmlPipe.
 * SafeHtmlPipe uses Angular DI internally; when the pipe is resolved as part of a
 * template it can be called in an invalid injection context on Angular 19+, triggering
 * NG0203. Inlining the sanitizer call here avoids that entirely.
 */
@Component({
  standalone: true,
  selector: 'T',
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="!translateParams.sanitize">{{ translatedStr }}</ng-container>
    <span *ngIf="translateParams.sanitize" [innerHTML]="sanitizedStr"></span>
  `,
  styles: [],
})
export class TComponent implements OnInit, OnDestroy, OnChanges {
  @Input() str = '';
  @Input() key?: string = '';
  @Input() context?: string = '';
  @Input() comment?: string = '';
  @Input() charlimit?: number = 0;
  @Input() tags?: string = '';
  @Input() escapeVars?: boolean = false;
  @Input() inline?: boolean = false;
  @Input() sanitize?: boolean = false;

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

  get sanitizedStr(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.translatedStr);
  }

  get localeChanged(): Observable<string> {
    return this.translationService.localeChanged;
  }

  onLocaleChange: Subscription | undefined;
  onTranslationsFetch: Subscription | undefined;

  private actualVars: Record<string, unknown> = {};

  constructor(
    protected translationService: TranslationService,
    protected instance: TxInstanceContext,
    protected sanitizer: DomSanitizer,
  ) {
    this.onLocaleChange = this.localeChanged.subscribe(() => {
      this.translate();
    });
    this.onTranslationsFetch = this.translationService.translationsFetched.subscribe(() => {
      this.translate();
    });
  }

  ngOnInit() {
    this.translate();
  }

  ngOnDestroy() {
    this.onLocaleChange?.unsubscribe();
    this.onLocaleChange = undefined;
    this.onTranslationsFetch?.unsubscribe();
    this.onTranslationsFetch = undefined;
  }

  ngOnChanges() {
    this.translate();
  }

  translate() {
    this.translatedStr = this.translationService.translate(
      this.str,
      { ...this.translateParams, ...this.vars },
      this.instance.alias || '',
    );
  }
}
