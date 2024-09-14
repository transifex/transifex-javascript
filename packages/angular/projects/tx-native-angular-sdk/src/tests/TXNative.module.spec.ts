import { TestBed } from '@angular/core/testing';
import { TranslationService, WsNativeModule } from '../public-api';

class CustomService {
  testMethod(): string {
    return 'test';
  }
}

describe('WsNativeModule', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WsNativeModule],
    });
  });

  it("should not provide 'CustomService' service", () => {
    expect(() => TestBed.inject(CustomService)).toThrowError(/No provider for/);
  });
});

describe('WsNativeModule.forRoot()', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WsNativeModule.forRoot()],
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
