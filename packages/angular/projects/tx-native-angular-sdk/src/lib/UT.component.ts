import { Component, ViewEncapsulation } from '@angular/core';

import { TXInstanceComponent } from './instance.component';
import { TComponent } from './T.component';
import { TranslationService } from './translation.service';

@Component({
  selector: 'UT',
  template: `
    <div *ngIf="!translateParams._inline" [innerHTML]="translatedStr | safeHtml"></div>
    <span *ngIf="translateParams._inline" [innerHTML]="translatedStr | safeHtml"></span>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})

/**
 * A translation component with escaped variables
 *
 * @param {string} str
 * @param {string=} key
 * @param {string=} context
 * @param {string=} comment
 * @param {number=} charlimit
 * @param {string=} tags
 * @param {boolean=} escapeVars
 * @param {boolean=} inline
 * @param {Object=} vars
 */
export class UTComponent extends TComponent {
  /**
   * Constructor
   *
   * @param translationService
   */
  constructor(translationService: TranslationService,
    protected instance: TXInstanceComponent) {
    super(translationService, instance);
    this.escapeVars = true;
  }
}
