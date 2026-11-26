import {
  ApplicationRef,
  Component,
  PLATFORM_ID,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { tx } from '@transifex/native';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

import { LanguagePickerComponent } from '../lib/language-picker.component';
import { TComponent } from '../lib/T.component';
import { UTComponent } from '../lib/UT.component';
import { TranslationService } from '../lib/translation.service';

/**
 * Zoneless is the default for Angular 21+ apps. Nothing patches async APIs there,
 * so every SDK component has to schedule its own change detection when a
 * translation or locale changes.
 */
@Component({
  standalone: true,
  imports: [TComponent, UTComponent],
  template: `<T str="Home"></T><UT str="<b>Home</b>" [inline]="true"></UT>`,
})
class OnlyTHostComponent {}

@Component({
  standalone: true,
  imports: [LanguagePickerComponent],
  template: `<tx-language-picker></tx-language-picker>`,
})
class PickerHostComponent {}

describe('Zoneless change detection', () => {
  let service: TranslationService;
  let locale = 'en';
  let originalTxLocale: string;

  beforeEach(async () => {
    locale = 'en';
    originalTxLocale = tx.currentLocale;
    await TestBed.configureTestingModule({
      imports: [OnlyTHostComponent, PickerHostComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();

    service = TestBed.inject(TranslationService);
    spyOn(service, 'translate').and.callFake((str: string) => {
      if (locale !== 'fr') {
        return str;
      }
      return str.replace('Home', 'Accueil');
    });
    spyOn(tx, 'setCurrentLocale').and.callFake(async (code: string) => {
      locale = code;
    });
    spyOn(tx, 'fetchTranslations').and.resolveTo();
  });

  afterEach(() => {
    // `tx` is a process-wide singleton shared with the other specs.
    tx.currentLocale = originalTxLocale;
  });

  it('should repaint T and UT after setCurrentLocale', async () => {
    // setup
    const fixture = TestBed.createComponent(OnlyTHostComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Home');

    // act
    await service.setCurrentLocale('fr');
    await fixture.whenStable();

    // assert
    expect(fixture.nativeElement.textContent).not.toContain('Home');
    expect(fixture.nativeElement.querySelector('T').textContent).toContain('Accueil');
    expect(fixture.nativeElement.querySelector('UT b').textContent).toBe('Accueil');
  });

  it('should repaint T after a tag fetch completes', async () => {
    // setup
    const fixture = TestBed.createComponent(OnlyTHostComponent);
    await fixture.whenStable();
    locale = 'fr';
    tx.currentLocale = 'fr';

    // act
    await service.fetchTranslations('home');
    await fixture.whenStable();

    // assert
    expect(fixture.nativeElement.querySelector('T').textContent).toContain('Accueil');
  });

  it('should render the language picker options once languages load', async () => {
    // setup
    spyOn(service, 'getLanguages').and.resolveTo([
      { code: 'en', name: 'English', localized_name: 'English', rtl: false },
      { code: 'fr', name: 'French', localized_name: 'Français', rtl: false },
    ]);

    // act
    const fixture = TestBed.createComponent(PickerHostComponent);
    await fixture.whenStable();

    // assert
    expect(fixture.nativeElement.querySelectorAll('option').length).toBe(2);
  });
});

describe('TranslationService app stability', () => {
  let release: () => void;

  function setUp(platformId: string): { service: TranslationService; appRef: ApplicationRef } {
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        { provide: PLATFORM_ID, useValue: platformId },
      ],
    });
    spyOn(tx, 'setCurrentLocale').and.callFake(
      () => new Promise<void>((resolve) => { release = resolve; }),
    );
    return { service: TestBed.inject(TranslationService), appRef: TestBed.inject(ApplicationRef) };
  }

  it('should keep the app unstable on the server until setCurrentLocale finishes', async () => {
    // setup
    const { service, appRef } = setUp('server');

    // act
    const pending = service.setCurrentLocale('fr');

    // assert
    expect(await firstValueFrom(appRef.isStable)).toBe(false);
    release();
    await pending;
    expect(await firstValueFrom(appRef.isStable.pipe(filter(Boolean)))).toBe(true);
  });

  it('should not affect app stability in the browser', async () => {
    // setup
    const { service, appRef } = setUp('browser');

    // act
    const pending = service.setCurrentLocale('fr');

    // assert
    expect(await firstValueFrom(appRef.isStable)).toBe(true);
    release();
    await pending;
  });
});
