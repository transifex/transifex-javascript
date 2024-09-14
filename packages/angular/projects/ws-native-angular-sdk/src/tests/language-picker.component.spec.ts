import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { LanguagePickerComponent } from '../lib/language-picker.component';
import {
  ILanguage,
  TranslationService,
  WSInstanceComponent,
} from '../public-api';

describe('LanguagePickerComponent', () => {
  let component: LanguagePickerComponent;
  let fixture: ComponentFixture<LanguagePickerComponent>;
  let service: TranslationService;
  let instance: WSInstanceComponent;

  const languages: ILanguage[] = [
    { code: 'en', name: 'English', localized_name: 'English', rtl: false },
    { code: 'el', name: 'Greek', localized_name: 'Ελληνικά', rtl: false },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LanguagePickerComponent, WSInstanceComponent],
      providers: [WSInstanceComponent],
    }).compileComponents();
    service = TestBed.inject(TranslationService);
    instance = TestBed.inject(WSInstanceComponent);
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
    await component.ngOnInit();

    // assert
    expect(service.getLanguages).toHaveBeenCalled();
    expect(component.languages).toBe(languages);
  });

  it('should show a select component with languages', async () => {
    // setup
    spyOn(service, 'getLanguages').and.resolveTo(languages);

    // act
    await component.ngOnInit();
    fixture.detectChanges();

    // assert
    const compiled = fixture.debugElement.nativeElement;
    const selectOptions = (compiled as HTMLDivElement).querySelector('select');
    expect((compiled as HTMLDivElement).innerHTML).toContain('<select');
    expect(selectOptions?.length).toBe(2);
  });

  it('should detect language change', async () => {
    // setup
    spyOn(service, 'getLanguages').and.resolveTo(languages);
    spyOn(service, 'setCurrentLocale').and.returnValue(Promise.resolve());
    spyOn(component, 'onChange').and.callThrough();

    // act
    await component.getLanguages();
    fixture.detectChanges();

    // assert
    const select: HTMLSelectElement = fixture.debugElement.query(
      By.css('.ws-language-picker')
    ).nativeElement;
    const optValue = select.options[1]?.value;
    if (optValue === undefined) {
      throw new Error('select.options[1]?.value is undefined');
    }
    select.value = optValue;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const optLabel = select.options[select.selectedIndex]?.label;
    if (optLabel === undefined) {
      throw new Error(
        'select.options[select.selectedIndex]?.label is undefined'
      );
    }
    expect(optLabel).toBe('Ελληνικά');
    expect(component.onChange).toHaveBeenCalled();
  });

  it('should get languages of an alternative instance', async () => {
    // setup
    instance.alias = 'test';
    instance.token = 'test';
    component.instance = instance;
    spyOnProperty(instance, 'instanceIsReady').and.returnValue(of(true));
    spyOn(service, 'getLanguages').and.resolveTo(languages);

    // act
    await instance.ngOnInit();
    component.ngOnInit();

    // assert
    expect(component.languages).toEqual(languages);
    expect(service.getLanguages).toHaveBeenCalled();
  });
});
