import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, ReplaySubject } from 'rxjs';
import { tx } from '@transifex/native';

import { TComponent } from '../src/lib/T.component';
import { SafeHtmlPipe, TranslationService, TXInstanceComponent } from '../src/public-api';


describe('TComponent', () => {
  let localeChangedSubject: ReplaySubject<string>;

  let component: TComponent;
  let fixture: ComponentFixture<TComponent>;
  let service: TranslationService;
  let instance: TXInstanceComponent;

  const translationParams = {
    _key: '',
    _context: '',
    _comment: '',
    _charlimit: 0,
    _tags: '',
    _escapeVars: false,
    _inline: false,
    sanitize: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TComponent, SafeHtmlPipe, TXInstanceComponent],
      providers: [TXInstanceComponent],
    })
      .compileComponents();

    localeChangedSubject = new ReplaySubject<string>(0);

    service = TestBed.inject(TranslationService);
    instance = TestBed.inject(TXInstanceComponent);

    spyOn(service, 'getCurrentLocale').and.returnValue('en');
    spyOnProperty(service, 'localeChanged', 'get').and.returnValue(localeChangedSubject);
    spyOn(service, 'setCurrentLocale').and.callFake(async (locale) => {
      localeChangedSubject.next(locale);
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    // setup
    spyOn(component, 'translate');
    const localeChangedSpy = spyOnProperty(component, 'localeChanged', 'get')
      .and.returnValue(of('el'));

    // act
    component.ngOnInit();
    fixture.detectChanges();

    // assert
    expect(component).toBeTruthy();
    expect(service).toBeTruthy();
    expect(component.localeChanged).toBeTruthy();
    expect(component.translate).toHaveBeenCalled();
    expect(component.localeChangeSubscription).toBeTruthy();
    expect(localeChangedSpy.calls.any()).toEqual(true);
  });

  it('should translate string', () => {
    // setup
    spyOn(service, 'translate').and.returnValue('translated');

    // act
    component.str = 'not-translated';
    component.ngOnInit();
    fixture.detectChanges();

    // assert
    expect(service.translate).toHaveBeenCalledWith('not-translated',
      { ...translationParams }, '');
    expect(component.translatedStr).toEqual('translated');
  });

  it('should translate string without vars', () => {
    // setup
    spyOn(service, 'translate').and.returnValue('translated');

    // act
    component.str = 'not-translated';
    component.vars = {};
    component.ngOnInit();
    fixture.detectChanges();

    // assert
    expect(service.translate).toHaveBeenCalledWith('not-translated',
      { ...translationParams }, '');
    expect(component.translatedStr).toEqual('translated');
  });

  it('should translate string with key', () => {
    // setup
    spyOn(service, 'translate').and.returnValue('translated');

    // act
    component.str = 'not-translated';
    component.key = 'key-not-translated';
    component.ngOnInit();
    fixture.detectChanges();

    // assert
    expect(service.translate).toHaveBeenCalledWith('not-translated',
      { ...translationParams, _key: 'key-not-translated' }, '');
    expect(component.translatedStr).toEqual('translated');
  });

  it('should translate and not sanitize the string', () => {
    // setup
    spyOn(service, 'translate').and.returnValue('<a>translated</a>');

    // act
    component.str = '<a>not-translated</a>';
    component.ngOnInit();
    fixture.detectChanges();

    // assert
    const compiled = fixture.debugElement.nativeElement;
    expect((compiled as HTMLDivElement).innerHTML)
      .toContain('&lt;a&gt;translated&lt;/a&gt;');
  });

  it('should translate and sanitize the string', () => {
    // setup
    spyOn(service, 'translate').and.returnValue('<a>translated</a>');

    // act
    component.str = '<a>not-translated</a>';
    component.sanitize = true;
    component.ngOnInit();
    fixture.detectChanges();

    // assert
    const compiled = fixture.debugElement.nativeElement;
    expect((compiled as HTMLDivElement).innerHTML)
      .toContain('<span><a>translated</a></span>');
  });

  it('should detect input parameters change and translate', () => {
    // setup
    spyOn(service, 'translate').and.returnValue('<a>translated</a>');
    spyOn(tx, 'translate');

    // act
    service.translate('test', { ...translationParams });
    component.str = 'other-value';
    component.ngOnChanges({
      str: new SimpleChange(null, component.str, true),
    });
    fixture.detectChanges();

    // assert
    expect(service.translate).toHaveBeenCalled();
    const compiled = fixture.debugElement.nativeElement;
    expect((compiled as HTMLDivElement).innerHTML)
      .toContain('&lt;a&gt;translated&lt;/a&gt;');
  });

  it('should detect localeChange and translate', async () => {
    // act
    component.str = 'not-translated';
    component.key = 'key-not-translated';
    component.ngOnInit();
    fixture.detectChanges();

    // change
    spyOn(service, 'translate').and.returnValue('translated-again');

    await service.setCurrentLocale('nb');

    fixture.detectChanges();

    // assert
    expect(service.translate).toHaveBeenCalledWith('not-translated',
      { ...translationParams, _key: 'key-not-translated' }, '');
    expect(component.translatedStr).toEqual('translated-again');
  });

  it('should respect changes to input params', async () => {
    // setup
    spyOn(service, 'translate').and.returnValue('translated');

    // act
    component.str = 'not-translated';
    component.key = 'key-not-translated';
    component.ngOnInit();
    fixture.detectChanges();

    component.context = 'late';
    component.ngOnChanges({});
    fixture.detectChanges();

    // assert
    expect(service.translate).toHaveBeenCalledWith('not-translated', {
      ...translationParams,
      _key: 'key-not-translated',
      _context: 'late',
    }, '');
    expect(component.translatedStr).toEqual('translated');
  });

  it('should translate string with an alternative instance', () => {
    // setup
    instance.token = 'instance-token';
    instance.alias = 'instance-alias';
    spyOn(service, 'translate').and.returnValue('translated');

    // act
    component.str = 'not-translated';
    component.ngOnInit();
    fixture.detectChanges();

    // assert
    expect(service.translate).toHaveBeenCalledWith('not-translated',
      { ...translationParams }, 'instance-alias');
    expect(component.translatedStr).toEqual('translated');
  });
});
