import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReplaySubject } from 'rxjs';

import { TranslationService, TXInstanceComponent } from '../src/public-api';


describe('TXInstanceComponent', () => {
  let localeChangedSubject: ReplaySubject<string>;

  let component: TXInstanceComponent;
  let fixture: ComponentFixture<TXInstanceComponent>;
  let service: TranslationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TXInstanceComponent],
      providers: [TXInstanceComponent],
    })
      .compileComponents();

    localeChangedSubject = new ReplaySubject<string>(0);

    service = TestBed.inject(TranslationService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TXInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create the component and the instance', async () => {
    // setup
    component.token = 'token';
    component.alias = 'alias';
    spyOn(service, 'addInstance').and.returnValue(Promise.resolve(true));
    spyOn(service, 'getInstance').and.returnValue({});

    // act
    await component.ngOnInit();
    fixture.detectChanges();

    // assert
    expect(component).toBeTruthy();
    expect(service).toBeTruthy();
    expect(service.addInstance).toHaveBeenCalled();
    expect(service.getInstance).toHaveBeenCalled();
    component.instanceIsReady.subscribe(
      (value) => expect(value).toBe(true),
    );
  });

  it('should create the component and fail to create the instance',
    async () => {
    // setup
      component.token = 'token';
      component.alias = 'alias';
      spyOn(service, 'addInstance').and.returnValue(Promise.resolve(false));
      spyOn(service, 'getInstance').and.returnValue(undefined);

      // act
      await component.ngOnInit();
      fixture.detectChanges();

      // assert
      expect(component).toBeTruthy();
      expect(service).toBeTruthy();
      expect(service.addInstance).toHaveBeenCalled();
      expect(service.getInstance).toHaveBeenCalled();
      component.instanceIsReady.subscribe(
        (value) => expect(value).toBe(false),
      );
    });
});
