import { TestBed } from '@angular/core/testing';
import { ILanguage, ITranslationConfig, TxNative, tx } from '@transifex/native';

import { TranslationService } from '../lib/translation.service';
import { ITranslationServiceConfig } from '../public-api';

describe('TranslationService', () => {
  let service: TranslationService;
  const txConfig: ITranslationServiceConfig = {
    token: '',
    cdsHost: '',
    filterTags: '',
    filterStatus: '',
  };
  const txTranslationConfig: ITranslationConfig = {
    token: '',
    cdsHost: '',
    filterTags: '',
    filterStatus: '',
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
    { code: 'en', name: 'English', localized_name: 'English', rtl: false },
    { code: 'el', name: 'Greek', localized_name: 'Ελληνικά', rtl: false },
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

  it('should init the TX Native object', async () => {
    spyOn(service, 'getInstance').and.returnValue({
      currentLocale: 'en',
      fetchTranslations: tx.fetchTranslations,
      init: tx.init,
      fetchedTags: { en: [] },
    } as unknown as TxNative);
    spyOn(service, 'getLanguages');

    // act
    await service.init(txConfig);

    // assert
    expect(service).toBeTruthy();
    expect(tx.init).toHaveBeenCalledWith({ ...txTranslationConfig });
  });

  it('should translate', () => {
    // setup
    spyOn(tx, 'translate').and.returnValue('translated');

    // act
    const result = service.translate('not-translated', {
      ...translationParams,
    });

    // assert
    expect(result).toBe('translated');
    expect(tx.translate).toHaveBeenCalledWith('not-translated', {
      ...translationParams,
    });
  });

  it('should translate with key', () => {
    // setup
    spyOn(tx, 'translate').and.returnValue('translated');

    // act
    const result = service.translate('not-translated', {
      ...translationParams,
      _key: 'key-string',
    });

    // assert
    expect(result).toBe('translated');
    expect(tx.translate).toHaveBeenCalledWith('not-translated', {
      ...translationParams,
      _key: 'key-string',
    });
  });

  it('should translate and escape', () => {
    // setup
    spyOn(tx, 'translate').and.returnValue('<b>Hola {username}</b>');

    // act
    const result = service.translate('<b>Hello {username}</b>', {
      ...translationParams,
      _escapeVars: true,
    });

    // assert
    expect(result).toBe('<b>Hola {username}</b>');
    expect(tx.translate).toHaveBeenCalledWith('<b>Hello {username}</b>', {
      ...translationParams,
      _escapeVars: true,
    });
  });

  it('should set current locale', async () => {
    // setup
    spyOn(tx, 'setCurrentLocale').and.resolveTo();

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
    spyOn(tx, 'getLanguages').and.resolveTo(languages);

    // act
    const result = await service.getLanguages();

    // assert
    expect(tx.getLanguages).toHaveBeenCalled();
    expect(result).toBe(languages);
  });

  it('should add a controlled instance successfully', async () => {
    // setup
    spyOn(tx, 'controllerOf').and.resolveTo();

    const instanceConfig = {
      token: 'token',
      alias: 'alias',
      controlled: true,
    };

    // act
    const result = await service.addInstance(instanceConfig);

    // assert
    expect(tx.controllerOf).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should add a not controlled instance successfully', async () => {
    // setup
    spyOn(tx, 'controllerOf').and.resolveTo();

    const instanceConfig = {
      token: 'token',
      alias: 'alias',
      controlled: false,
    };

    // act
    const result = await service.addInstance(instanceConfig);

    // assert
    expect(tx.controllerOf).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should not add a malformed instance (alias)', async () => {
    // setup
    spyOn(tx, 'controllerOf').and.resolveTo();

    const instanceConfig = {
      token: 'token',
      alias: '',
      controlled: false,
    };

    // act/assert
    await expectAsync(service.addInstance(instanceConfig)).toBeResolvedTo(
      false
    );
    expect(tx.controllerOf).not.toHaveBeenCalled();
  });

  it('should not add a malformed instance (token)', async () => {
    // setup
    spyOn(tx, 'controllerOf').and.resolveTo();

    const instanceConfig = {
      token: '',
      alias: 'alias',
      controlled: false,
    };

    // act/assert
    await expectAsync(service.addInstance(instanceConfig)).toBeResolvedTo(
      false
    );
    expect(tx.controllerOf).not.toHaveBeenCalled();
  });

  it('should not add an existing instance', async () => {
    // setup
    const instanceConfig = {
      token: 'token',
      alias: 'alias',
      controlled: false,
    };
    await service.addInstance(instanceConfig);
    spyOn(tx, 'controllerOf').and.resolveTo();

    // act
    const result = await service.addInstance(instanceConfig);

    // assert
    expect(tx.controllerOf).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should not add instance when exception occurs', async () => {
    // setup
    const instanceConfig = {
      token: 'token',
      alias: 'alias',
      controlled: true,
    };

    spyOn(tx, 'controllerOf').and.throwError('error');

    // act
    const result = await service.addInstance(instanceConfig);

    // assert
    expect(tx.controllerOf).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should fetch translations on demand without custom instance', async () => {
    // setup
    spyOn(tx, 'fetchTranslations').and.resolveTo();
    spyOn(service, 'getInstance').and.returnValue({
      currentLocale: 'en',
      fetchTranslations: tx.fetchTranslations,
      fetchedTags: { en: [] },
    } as unknown as TxNative);

    // act
    await service.fetchTranslations('tag1');

    // assert
    expect(tx.fetchTranslations).toHaveBeenCalledWith('en', {
      filterTags: 'tag1',
    });
  });

  it('should fetch translations on demand without custom instance no fetched tags', async () => {
    // setup
    spyOn(tx, 'fetchTranslations').and.resolveTo();
    spyOn(service, 'getInstance').and.returnValue({
      currentLocale: 'en',
      fetchTranslations: tx.fetchTranslations,
      fetchedTags: undefined,
    } as unknown as TxNative);

    // act
    await service.fetchTranslations('tag1');

    // assert
    expect(tx.fetchTranslations).toHaveBeenCalledWith('en', {
      filterTags: 'tag1',
    });
  });

  it('should fetch translations on demand with custom instance', async () => {
    // setup
    spyOn(tx, 'fetchTranslations').and.resolveTo();
    spyOn(service, 'getInstance').and.returnValue({
      currentLocale: 'en',
      fetchTranslations: tx.fetchTranslations,
      fetchedTags: [],
    } as unknown as TxNative);

    // act
    await service.fetchTranslations('tag1', 'my-instance');

    // assert
    expect(service.getInstance).toHaveBeenCalledWith('my-instance');
    expect(tx.fetchTranslations).toHaveBeenCalledWith('en', {
      filterTags: 'tag1',
    });
  });

  it('should not fetch translations on demand if no instance', async () => {
    // setup
    spyOn(tx, 'fetchTranslations').and.resolveTo();

    // act
    await service.fetchTranslations('tag1');

    // assert
    expect(tx.fetchTranslations).not.toHaveBeenCalled();
  });
});
