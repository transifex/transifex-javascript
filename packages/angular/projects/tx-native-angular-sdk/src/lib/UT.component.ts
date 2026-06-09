import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

import { TxInstanceContext } from './tx-instance-context';
import { TComponent } from './T.component';
import { TranslationService } from './translation.service';

@Component({
  standalone: true,
  selector: 'UT',
  imports: [CommonModule],
  template: `
    <div *ngIf="!translateParams._inline" [innerHTML]="sanitizedStr"></div>
    <span *ngIf="translateParams._inline" [innerHTML]="sanitizedStr"></span>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class UTComponent extends TComponent {
  constructor(
    translationService: TranslationService,
    protected override instance: TxInstanceContext,
    sanitizer: DomSanitizer,
  ) {
    super(translationService, instance, sanitizer);
    this.escapeVars = true;
  }
}
