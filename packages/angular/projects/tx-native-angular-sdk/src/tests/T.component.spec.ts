import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ws } from '@wordsmith/native';
import { ReplaySubject } from 'rxjs';

import { TComponent } from '../lib/T.component';
import {
  SafeHtmlPipe,
  TranslationService,
  TXInstanceComponent,
} from '../public-api';

describe('TComponent', () => {
  let localeChangedSubject: ReplaySubject<string>;

  let component: TComponent;
  let fixture: ComponentFixture<TComponent>;
  let service: TranslationService;
  let instance: TXInstanceComponent;
  let localeChangedSpy: jasmine.Spy<jasmine.Func>;

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
    }).compileComponents();

    localeChangedSubject = new ReplaySubject<string>(0);

    service = TestBed.inject(TranslationService);
    instance = TestBed.inject(TXInstanceComponent);

    spyOn(service, 'getCurrentLocale').and.returnValue('en');
    localeChangedSpy = spyOnProperty(
      service,
      'localeChanged',
      'get'
    ).and.returnValue(localeChangedSubject);
    spyOn(service, 'setCurrentLocale').and.callFake(async (locale) => {
      localeChangedSubject.next(locale);
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', async () => {
    // setup
    spyOn(component, 'translate');
    localeChangedSpy = spyOnProperty(
      component,
      'localeChanged',
      'get'
    ).and.returnValue(localeChangedSubject);

    // act
    component.ngOnInit();
    await service.fetchTranslations('nb');
    fixture.detectChanges();

    // assert
    expect(component).toBeTruthy();
    expect(service).toBeTruthy();
    expect(component.localeChanged).toBeTruthy();
    expect(component.translate).toHaveBeenCalled();
    expect(component.onLocaleChange).toBeTruthy();
    expect(component.onTranslationsFetch).toBeTruthy();
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
    expect(service.translate).toHaveBeenCalledWith(
      'not-translated',
      { ...translationParams },
      ''
    );
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
    expect(service.translate).toHaveBeenCalledWith(
      'not-translated',
      { ...translationParams },
      ''
    );
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
    expect(service.translate).toHaveBeenCalledWith(
      'not-translated',
      { ...translationParams, _key: 'key-not-translated' },
      ''
    );
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
    expect((compiled as HTMLDivElement).innerHTML).toContain(
      '&lt;a&gt;translated&lt;/a&gt;'
    );
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
    expect((compiled as HTMLDivElement).innerHTML).toContain(
      '<span><a>translated</a></span>'
    );
  });

  it('should detect input parameters change and translate', () => {
    // setup
    spyOn(service, 'translate').and.returnValue('<a>translated</a>');
    spyOn(ws, 'translate');

    // act
    service.translate('test', { ...translationParams });
    component.str = 'other-value';
    component.ngOnChanges();
    fixture.detectChanges();

    // assert
    expect(service.translate).toHaveBeenCalled();
    const compiled = fixture.debugElement.nativeElement;
    expect((compiled as HTMLDivElement).innerHTML).toContain(
      '&lt;a&gt;translated&lt;/a&gt;'
    );
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
    expect(service.translate).toHaveBeenCalledWith(
      'not-translated',
      { ...translationParams, _key: 'key-not-translated' },
      ''
    );
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
    component.ngOnChanges();
    fixture.detectChanges();

    // assert
    expect(service.translate).toHaveBeenCalledWith(
      'not-translated',
      {
        ...translationParams,
        _key: 'key-not-translated',
        _context: 'late',
      },
      ''
    );
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
    expect(service.translate).toHaveBeenCalledWith(
      'not-translated',
      { ...translationParams },
      'instance-alias'
    );
    expect(component.translatedStr).toEqual('translated');
  });

  it('should detect translationsFetched', async () => {
    // setup
    spyOn(service, 'translate').and.returnValue('translated');

    // act
    component.str = 'not-translated';
    component.ngOnInit();
    fixture.detectChanges();

    // change
    await service.fetchTranslations('tag1');
    fixture.detectChanges();

    // assert
    expect(service.translate).toHaveBeenCalled();
  });

  it('should detect translationsFetched using alternative instance', async () => {
    // setup
    instance.token = 'instance-token';
    instance.alias = 'instance-alias';
    spyOn(service, 'translate').and.returnValue('translated');

    // act
    component.str = 'not-translated';
    component.ngOnInit();
    fixture.detectChanges();

    // change
    await service.fetchTranslations('tag1');
    fixture.detectChanges();

    // assert
    expect(service.translate).toHaveBeenCalledWith(
      'not-translated',
      { ...translationParams },
      'instance-alias'
    );
  });
});
