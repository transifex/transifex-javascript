import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { LanguagePickerComponent } from '../src/lib/language-picker.component';
import { ILanguage, TranslationService, TXInstanceComponent } from '../src/public-api';

describe('LanguagePickerComponent', () => {
  let component: LanguagePickerComponent;
  let fixture: ComponentFixture<LanguagePickerComponent>;
  let service: TranslationService;
  let instance: TXInstanceComponent;

  const languages: ILanguage[] = [
    { code: 'en', name: 'English', localized_name: 'English', rtl: false },
    { code: 'el', name: 'Greek', localized_name: 'Ελληνικά', rtl: false },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LanguagePickerComponent, TXInstanceComponent ],
      providers: [ TXInstanceComponent ],
    })
      .compileComponents();

    service = TestBed.inject(TranslationService);
    instance = TestBed.inject(TXInstanceComponent);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguagePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get languages', async () => {
    // setup
    spyOn(service, 'getLanguages').and.resolveTo(languages);

    // act
    await component.getLanguages();

    // assert
    expect(service.getLanguages).toHaveBeenCalled();
    expect(component.languages).toBe(languages);
  });

  it('should show a select component with languages', async () => {
    // setup
    spyOn(service, 'getLanguages').and.resolveTo(languages);

    // act
    await component.getLanguages();
    fixture.detectChanges();

    // assert
    const compiled: HTMLElement = fixture.debugElement.nativeElement;
    const selectOptions = compiled.querySelector('select');
    expect(compiled.innerHTML).toContain('<select');
    expect(selectOptions?.length).toBe(2);
  });

  it('should detect language change', async () => {
    // setup
    spyOn(service, 'getLanguages').and.resolveTo(languages);
    spyOn(service, 'setCurrentLocale').and.resolveTo();
    spyOn(component, 'onChange').and.callThrough();

    // act
    await component.getLanguages();
    fixture.detectChanges();

    // assert
    const select: HTMLSelectElement = fixture.debugElement.query(By.css('.tx-language-picker')).nativeElement;
    const optValue = select.options[1]?.value;
    if (optValue === undefined) {
      throw new Error('select.options[1]?.value is undefined');
    }
    select.value = optValue;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const optLabel = select.options[select.selectedIndex]?.label;
    if (optLabel === undefined) {
      throw new Error('select.options[select.selectedIndex]?.label is undefined');
    }
    const text = optLabel;
    expect(text).toBe('Ελληνικά');
    expect(component.onChange).toHaveBeenCalled();
  });

  it('should get languages of an alternative instance', async () => {
    // setup
    instance.alias = 'test';
    instance.token = 'test';
    component.instance = instance;
    spyOnProperty(component, 'instanceReady', 'get').and.returnValue(of(true));
    spyOn(service, 'getLanguages').and.resolveTo(languages);

    // act
    await instance.ngOnInit();
    component.ngOnInit();

    // assert
    expect(component.languages).toEqual(languages);
    expect(service.getLanguages).toHaveBeenCalled();
  });
});
