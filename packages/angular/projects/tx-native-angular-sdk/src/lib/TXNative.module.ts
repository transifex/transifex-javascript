import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LanguagePickerComponent } from './language-picker.component';
import { TComponent } from './T.component';
import { UTComponent } from './UT.component';
import { SafeHtmlPipe } from './safe-html.pipe';
import { TranslatePipe } from './translate.pipe';
import { TXInstanceComponent } from './instance.component';
import { LoadTranslationsDirective } from './load-translations.directive';
import { provideTxNativeEagerTranslationService } from './tx-native.providers';


@NgModule({
  imports: [
    CommonModule,
    TComponent,
    UTComponent,
    LanguagePickerComponent,
    SafeHtmlPipe,
    TranslatePipe,
    TXInstanceComponent,
    LoadTranslationsDirective,
  ],
  exports: [
    TComponent,
    UTComponent,
    LanguagePickerComponent,
    SafeHtmlPipe,
    TranslatePipe,
    TXInstanceComponent,
    LoadTranslationsDirective,
  ],
  // TxInstanceContext is providedIn: 'root' — no registration needed here.
  // TranslationService is providedIn: 'root'. forRoot() adds provideAppInitializer
  // (see provideTxNativeEagerTranslationService) so @T works before any injection.
  providers: [],
})
export class TxNativeModule {
  /**
   * Use this method in your root module to provide the TranslationService
   */
  static forRoot(): ModuleWithProviders<TxNativeModule> {
    return {
      ngModule: TxNativeModule,
      providers: [provideTxNativeEagerTranslationService()],
    };
  }
}
