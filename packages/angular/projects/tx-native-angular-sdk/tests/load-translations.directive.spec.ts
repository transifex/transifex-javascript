import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReplaySubject } from 'rxjs';

import { LoadTranslationsDirective, TranslationService } from '../src/public-api';

describe('LoadTranslationsDirective', () => {
  @Component({
    template: `
      <div [txLoadTranslations]="'tag1'"></div>
    `,
  })
  class TestComponent {}

  let localeChangedSubject: ReplaySubject<string>;

  let directives: DebugElement[];
  let fixture: ComponentFixture<TestComponent>;
  let service: TranslationService;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [ LoadTranslationsDirective, TestComponent ],
      providers: [],
    })
      .createComponent(TestComponent);

    localeChangedSubject = new ReplaySubject<string>(0);

    service = TestBed.inject(TranslationService);

    spyOn(service, 'getCurrentLocale').and.returnValue('en');
    spyOnProperty(service, 'localeChanged', 'get').and.returnValue(localeChangedSubject);
    spyOn(service, 'setCurrentLocale').and.callFake(async (locale) => {
      localeChangedSubject.next(locale);
    });

    directives = fixture.debugElement.queryAll(By.directive(LoadTranslationsDirective));
    fixture.detectChanges();
  });

  it('should create the directive', () => {
    // assert
    expect(directives.length).toBe(1);
  });

  it('destroys the directive', () => {
    // setup
    const directive = new LoadTranslationsDirective(service);

    // act
    directive.ngOnDestroy();

    // assert
    expect(directive.onLocaleChange).toBeFalsy();
  });

  it('should detect localeChange and translate', async () => {
    // setup
    spyOn(service, 'fetchTranslations');
    const directive = new LoadTranslationsDirective(service);

    // act
    await service.setCurrentLocale('nb');

    // assert
    expect(directive).toBeTruthy();
    expect(service.fetchTranslations).toHaveBeenCalled();
  });
});
