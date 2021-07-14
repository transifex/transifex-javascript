import { TestBed } from '@angular/core/testing';
import { TranslationService } from '../src/lib/translation.service';
import { ILanguage, ITranslationServiceConfig } from '../src/public-api';

const { tx } = require('@transifex/native');

describe('TranslationService', () => {
  let service: TranslationService;
  const txConfig: ITranslationServiceConfig = {
    token: '',
    cache: () => { },
    cdsHost: '',
    errorPolicy: undefined,
    filterTags: '',
    missingPolicy: undefined,
    stringRenderer: undefined,
  };
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
  const languages: ILanguage[] = [
    { code: 'en', name: 'English', localized_name: 'English' },
    { code: 'el', name: 'Greek', localized_name: 'Ελληνικά' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslationService);
    spyOn(tx, 'init');
  });

  it('should be created', () => {
    // assert
    expect(service).toBeTruthy();
  });

  it('should init the TX Native object', () => {
    // act
    service.init(txConfig);

    // assert
    expect(service).toBeTruthy();
    expect(tx.init).toHaveBeenCalledWith(
      { ...txConfig },
    );
  });

  it('should translate', () => {
    // setup
    spyOn(tx, 'translate').and.returnValue('translated');

    // act
    const result = service
      .translate('not-translated', { ...translationParams });

    // assert
    expect(result).toBe('translated');
    expect(tx.translate).toHaveBeenCalledWith(
      'not-translated', { ...translationParams },
    );
  });

  it('should translate with key', () => {
    // setup
    spyOn(tx, 'translate').and.returnValue('translated');

    // act
    const result = service
      .translate('not-translated',
        { ...translationParams, _key: 'key-string' });

    // assert
    expect(result).toBe('translated');
    expect(tx.translate).toHaveBeenCalledWith(
      'not-translated', { ...translationParams, _key: 'key-string' },
    );
  });

  it('should translate and escape', () => {
    // setup
    spyOn(tx, 'translate').and.returnValue('<b>Hola {username}</b>');

    // act
    const result = service
      .translate('<b>Hello {username}</b>',
        { ...translationParams, _escapeVars: true });

    // assert
    expect(result).toBe('<b>Hola {username}</b>');
    expect(tx.translate).toHaveBeenCalledWith(
      '<b>Hello {username}</b>', { ...translationParams, _escapeVars: true },
    );
  });

  it('should set current locale', async () => {
    // setup
    spyOn(tx, 'setCurrentLocale').and.returnValue(Promise.resolve());

    // act
    await service.setCurrentLocale('el');

    // assert
    expect(tx.setCurrentLocale).toHaveBeenCalledWith('el');
  });

  it('should get current locale', () => {
    // setup
    spyOn(tx, 'getCurrentLocale').and.returnValue('en');

    // act
    const result = service.getCurrentLocale();

    // assert
    expect(tx.getCurrentLocale).toHaveBeenCalled();
    expect(result).toBe('en');
  });

  it('should get languages', async () => {
    // setup
    spyOn(tx, 'getLanguages').and.returnValue(Promise.resolve(languages));

    // act
    const result = await service.getLanguages();

    // assert
    expect(tx.getLanguages).toHaveBeenCalled();
    expect(result).toBe(languages);
  });
});
