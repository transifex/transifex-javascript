import { ComponentFixture, TestBed } from '@angular/core/testing';
import { tx } from '@transifex/native';

import { TranslationService, TXInstanceComponent } from '../src/public-api';

describe('TXInstanceComponent', () => {
  let component: TXInstanceComponent;
  let fixture: ComponentFixture<TXInstanceComponent>;
  let service: TranslationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TXInstanceComponent ],
      providers: [ TXInstanceComponent ],
    })
      .compileComponents();

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
    spyOn(service, 'addInstance').and.resolveTo(true);
    spyOn(service, 'getInstance').and.returnValue(tx);

    // act
    await component.ngOnInit();
    fixture.detectChanges();

    // assert
    expect(component).toBeTruthy();
    expect(service).toBeTruthy();
    expect(service.addInstance).toHaveBeenCalled();
    expect(service.getInstance).toHaveBeenCalled();
    component.instanceIsReady.subscribe((value) => expect(value).toBe(true));
  });

  it('should create the component and fail to create the instance', async () => {
    // setup
    component.token = 'token';
    component.alias = 'alias';
    spyOn(service, 'addInstance').and.resolveTo(false);
    spyOn(service, 'getInstance');

    // act
    await component.ngOnInit();
    fixture.detectChanges();

    // assert
    expect(component).toBeTruthy();
    expect(service).toBeTruthy();
    expect(service.addInstance).toHaveBeenCalled();
    expect(service.getInstance).toHaveBeenCalled();
    component.instanceIsReady.subscribe((value) => expect(value).toBe(false));
  });
});
