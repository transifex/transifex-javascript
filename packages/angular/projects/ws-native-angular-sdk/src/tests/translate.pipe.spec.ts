import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ws } from '@wordsmith/native';
import { ReplaySubject } from 'rxjs';
import { TranslatePipe } from '../lib/translate.pipe';
import { TranslationService } from '../lib/translation.service';
import { WSInstanceComponent } from '../public-api';

describe('TranslatePipe', () => {
  let localeChangedSubject: ReplaySubject<string>;
  let translatePipe: TranslatePipe;
  let service: TranslationService;
  let cdref: ChangeDetectorRef;
  let instance: WSInstanceComponent;

  const translationParams = {
    _key: 'translation-key',
    _context: '',
    _comment: '',
    _charlimit: 0,
    _tags: '',
    _escapeVars: false,
    _inline: false,
    sanitize: false,
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [WSInstanceComponent],
      providers: [
        TranslationService,
        WSInstanceComponent,
        {
          provide: ChangeDetectorRef,
          useValue: jasmine.createSpyObj<ChangeDetectorRef>(
            'ChangeDetectorRef',
            ['markForCheck']
          ),
        },
      ],
    });

    service = TestBed.inject(TranslationService);
    cdref = TestBed.inject(ChangeDetectorRef);
    instance = TestBed.inject(WSInstanceComponent);
    translatePipe = new TranslatePipe(service, instance, cdref);

    localeChangedSubject = new ReplaySubject<string>(0);

    spyOn(service, 'getCurrentLocale').and.returnValue('en');
    spyOnProperty(service, 'localeChanged', 'get').and.returnValue(
      localeChangedSubject
    );
    spyOn(service, 'setCurrentLocale').and.callFake(async (locale) => {
      localeChangedSubject.next(locale);
    });

    spyOn(ws, 'init');
    spyOn(ws, 'setCurrentLocale');

    await service.init({ token: 'test' });
    await service.setCurrentLocale('el');
  });

  it('is defined', () => {
    expect(TranslatePipe).toBeDefined();
    expect(translatePipe).toBeDefined();
    expect(translatePipe instanceof TranslatePipe).toBeTruthy();
  });

  it('should call markForChanges when it translates a string', async () => {
    // setup
    spyOn(service, 'translate').and.returnValue('translated');

    // act
    translatePipe.transform('not-translated');

    // assert
    expect(cdref.markForCheck).toHaveBeenCalled();
  });

  it('should translate string', () => {
    // setup
    spyOn(service, 'translate').and.returnValue('translated');

    // act
    const translatedStr = translatePipe.transform('not-translated');

    // assert
    expect(service.translate).toHaveBeenCalledWith('not-translated', {}, '');
    expect(translatedStr).toEqual('translated');
  });

  it('should translate string with params', () => {
    // setup
    spyOn(service, 'translate').and.returnValue('translated');

    // act
    const translatedStr = translatePipe.transform(
      'not-translated',
      translationParams
    );

    // assert
    expect(service.translate).toHaveBeenCalledWith(
      'not-translated',
      { ...translationParams },
      ''
    );
    expect(translatedStr).toEqual('translated');
  });

  it('should translate string with another instance', () => {
    // setup
    instance.token = 'token';
    instance.alias = 'alias';
    translatePipe = new TranslatePipe(service, instance, cdref);
    spyOn(service, 'translate').and.returnValue('translated');

    // act
    const translatedStr = translatePipe.transform('not-translated');

    // assert
    expect(service.translate).toHaveBeenCalledWith(
      'not-translated',
      {},
      'alias'
    );
    expect(translatedStr).toEqual('translated');
  });

  it('destroys an instance', () => {
    // setup
    instance.token = 'token';
    instance.alias = 'alias';
    translatePipe = new TranslatePipe(service, instance, cdref);
    spyOn(service, 'translate').and.returnValue('translated');

    // act
    translatePipe.transform('not-translated');

    translatePipe.ngOnDestroy();
    expect(translatePipe.onLocaleChange).toBeFalsy();
  });
});
