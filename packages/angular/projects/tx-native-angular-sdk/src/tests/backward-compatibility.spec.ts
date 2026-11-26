import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

import { LanguagePickerComponent } from '../lib/language-picker.component';
import { TComponent } from '../lib/T.component';
import { TranslationService } from '../lib/translation.service';
import { TxInstanceContext } from '../lib/tx-instance-context';
import { UTComponent } from '../lib/UT.component';

/**
 * Public classes must stay constructible with `new` outside Angular DI,
 * as they were before change detection support was added.
 */
describe('Construction outside Angular DI', () => {
  it('should create and translate with TComponent, UTComponent and the picker using new', () => {
    // setup
    const service = new TranslationService();
    const context = new TxInstanceContext();
    const sanitizer = TestBed.inject(DomSanitizer);
    spyOn(service, 'translate').and.returnValue('translated');

    // act
    const t = new TComponent(service, context, sanitizer);
    const ut = new UTComponent(service, context, sanitizer);
    const picker = new LanguagePickerComponent(service, context);
    t.translate();
    ut.translate();

    // assert
    expect(t.translatedStr).toBe('translated');
    expect(ut.translatedStr).toBe('translated');
    expect(picker).toBeTruthy();
    picker.ngOnDestroy();
    t.ngOnDestroy();
    ut.ngOnDestroy();
  });
});
