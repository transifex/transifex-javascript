import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from '../src/lib/translate.pipe';
import { TranslationService } from '../src/lib/translation.service';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let service: TranslationService;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TranslationService],
    });

    service = TestBed.inject(TranslationService);
    pipe = new TranslatePipe(service);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should translate string', () => {
    // setup
    spyOn(service, 'translate').and.returnValue('translated');

    // act
    const translatedStr = pipe.transform('not-translated');

    // assert
    expect(service.translate).toHaveBeenCalledWith('not-translated', {});
    expect(translatedStr).toEqual('translated');
  });

  it('should translate string with params', () => {
    // setup
    spyOn(service, 'translate').and.returnValue('translated');

    // act
    const translatedStr = pipe.transform('not-translated', translationParams);

    // assert
    expect(service.translate).toHaveBeenCalledWith('not-translated', {
      ...translationParams,
    });
    expect(translatedStr).toEqual('translated');
  });
});
