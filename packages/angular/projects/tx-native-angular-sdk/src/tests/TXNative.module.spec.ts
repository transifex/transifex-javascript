import { TestBed } from '@angular/core/testing';
import { TranslationService, TxNativeModule } from '../public-api';

class CustomService {
  testMethod(): string {
    return 'test';
  }
}

describe('TxNativeModule', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TxNativeModule],
    });
  });

  it("should not provide 'CustomService' service", () => {
    expect(() => TestBed.inject(CustomService)).toThrowError(/No provider for/);
  });
});

describe('TxNativeModule.forRoot()', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TxNativeModule.forRoot()],
    });
  });

  it('should provide services', () => {
    // assert
    expect(TestBed.inject(TranslationService)).toBeTruthy();
  });

  it("should provide a single instance for 'TranslationService'", () => {
    const translationService: TranslationService =
      TestBed.inject(TranslationService);

    // assert
    expect(translationService).toBeDefined();
  });
});
