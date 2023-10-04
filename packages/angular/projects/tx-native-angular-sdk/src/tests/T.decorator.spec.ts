import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { tx } from '@transifex/native';

import { T } from '../lib/T.decorator';

describe('T Decorator', () => {
  @Component({
    template: '<div>{{ testProperty }}</div>',
  })
  class TestComponent {
    @T('not-trans-dec', { _key: 'test' }) testProperty!: string;
  }

  @Component({
    template: '<div>{{ testProperty }}</div>',
  })
  class TestWithInstanceComponent {
    @T(
      'not-trans-dec',
      { _key: 'test' },
      { alias: 'alias', controlled: true, token: '' }
    )
    testProperty!: string;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ teardown: { destroyAfterEach: false } });
  });

  beforeEach(() => {
    spyOn(tx, 'translate').and.returnValue('ok-translated-dec');
  });

  it('should test the decorator T', () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    expect(tx.translate).toHaveBeenCalled();
    expect(tx.translate).toHaveBeenCalledWith('not-trans-dec', {
      _key: 'test',
    });
    expect(component.testProperty).toBe('ok-translated-dec');

    const compiled: HTMLElement = fixture.debugElement.nativeElement;
    expect(compiled.innerHTML).toContain('ok-translated-dec');
  });

  it('should test the decorator T with an instance', () => {
    const fixtureWithInstance = TestBed.createComponent(
      TestWithInstanceComponent
    );
    const component = fixtureWithInstance.componentInstance;

    fixtureWithInstance.detectChanges();
    expect(tx.translate).toHaveBeenCalled();
    expect(tx.translate).toHaveBeenCalledWith('not-trans-dec', {
      _key: 'test',
    });
    expect(component.testProperty).toBe('ok-translated-dec');

    const compiled: HTMLElement =
      fixtureWithInstance.debugElement.nativeElement;
    expect(compiled.innerHTML).toContain('ok-translated-dec');
  });
});
