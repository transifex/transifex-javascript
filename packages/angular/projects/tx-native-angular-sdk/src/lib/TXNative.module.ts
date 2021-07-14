import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LanguagePickerComponent } from './language-picker.component';
import { TComponent } from './T.component';
import { UTComponent } from './UT.component';
import { SafeHtmlPipe } from './safe-html.pipe';
import { TranslationService } from './translation.service';

@NgModule({
  declarations: [
    TComponent,
    UTComponent,
    LanguagePickerComponent,
    SafeHtmlPipe,
  ],
  imports: [CommonModule],
  exports: [
    TComponent,
    UTComponent,
    LanguagePickerComponent,
    SafeHtmlPipe,
  ],
})
export class TxNativeModule {
  /**
   * Use this method in your root module to provide the TranslationService
   */
  static forRoot(): ModuleWithProviders<TxNativeModule> {
    return {
      ngModule: TxNativeModule,
      providers: [
        TranslationService,
      ],
    };
  }
}
