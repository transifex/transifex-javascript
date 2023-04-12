import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { tx } from '@transifex/native';

import { T } from '../src/lib/T.decorator';

describe('T Decorator', () => {
  const instanceConfig = {
    token: 'token',
    alias: 'alias',
    controlled: false,
  };

  @Component({
    selector: 'test-cmp',
    template: '<div>{{ testProperty }}</div>',
    styles: [],
  })
  class TestComponent {
    @T('not-trans-dec', { _key: 'test' }) testProperty!: string;
  }

  @Component({
    selector: 'test-cmp',
    template: '<div>{{ testProperty }}</div>',
    styles: [],
  })
  class TestWithInstanceComponent {
    @T('not-trans-dec', { _key: 'test' }, instanceConfig) testProperty!: string;
  }

  let fixture: ComponentFixture<TestComponent>;

  let fixtureWithInstance: ComponentFixture<TestWithInstanceComponent>;

  beforeEach(() => {
    spyOn(tx, 'translate').and.returnValue('ok-translated-dec');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    fixtureWithInstance = TestBed.createComponent(TestWithInstanceComponent);
    fixtureWithInstance.detectChanges();
  });

  it('should test the decorator T', () => {
    const compiled: HTMLElement = fixture.debugElement.nativeElement;
    expect(tx.translate).toHaveBeenCalled();
    expect(compiled.innerHTML).toContain('ok-translated-dec');
  });

  it('should test the decorator T with an instance', () => {
    const compiled: HTMLElement = fixtureWithInstance.debugElement.nativeElement;
    expect(tx.translate).toHaveBeenCalled();
    setTimeout(() => {
      expect(compiled.innerHTML).toContain('ok-translated-dec');
    }, 1000);
  });
});
