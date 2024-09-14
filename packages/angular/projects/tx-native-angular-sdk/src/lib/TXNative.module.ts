import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LanguagePickerComponent } from './language-picker.component';
import { TComponent } from './T.component';
import { UTComponent } from './UT.component';
import { SafeHtmlPipe } from './safe-html.pipe';
import { TranslationService } from './translation.service';
import { TranslatePipe } from './translate.pipe';
import { TXInstanceComponent } from './instance.component';
import { LoadTranslationsDirective } from './load-translations.directive';


@NgModule({
  declarations: [
    TComponent,
    UTComponent,
    LanguagePickerComponent,
    SafeHtmlPipe,
    TranslatePipe,
    TXInstanceComponent,
    LoadTranslationsDirective,
  ],
  imports: [CommonModule],
  exports: [
    TComponent,
    UTComponent,
    LanguagePickerComponent,
    SafeHtmlPipe,
    TranslatePipe,
    TXInstanceComponent,
    LoadTranslationsDirective,
  ],
  providers: [
    TXInstanceComponent,
  ],
})
export class WsNativeModule {
  /**
   * Use this method in your root module to provide the TranslationService
   */
  static forRoot(): ModuleWithProviders<WsNativeModule> {
    return {
      ngModule: WsNativeModule,
      providers: [
        TranslationService,
      ],
    };
  }
}
