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

export class UTComponent extends TComponent {
  constructor(
      translationService: TranslationService,
      protected override instance: TXInstanceComponent,
  ) {
    super(translationService, instance);
    this.escapeVars = true;
  }
}
