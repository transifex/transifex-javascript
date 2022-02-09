/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { Component, OnInit } from '@angular/core';
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
    template: '<div>{{testProperty}}</div>',
    styles: [],
  })
  class TestComponent implements OnInit {
    @T('not-trans-dec', { _key: 'test' })
      testProperty: any;

    ngOnInit() {
    }
  }

  @Component({
    selector: 'test-cmp',
    template: '<div>{{testProperty}}</div>',
    styles: [],
  })
  class TestWithInstanceComponent implements OnInit {
    @T('not-trans-dec', { _key: 'test' }, instanceConfig)
      testProperty: any;

    ngOnInit() {
    }
  }

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  let componentWithInstance: TestWithInstanceComponent;
  let fixtureWithInstance: ComponentFixture<TestWithInstanceComponent>;

  beforeEach(() => {
    spyOn(tx, 'translate').and.returnValue('ok-translated-dec');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    fixtureWithInstance = TestBed.createComponent(TestWithInstanceComponent);
    componentWithInstance = fixtureWithInstance.componentInstance;
    fixtureWithInstance.detectChanges();
  });

  it('should test the decorator T', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(tx.translate).toHaveBeenCalled();
    expect((compiled as HTMLDivElement).innerHTML)
      .toContain('ok-translated-dec');
  });

  it('should test the decorator T with an instance', () => {
    const compiled = fixtureWithInstance.debugElement.nativeElement;
    expect(tx.translate).toHaveBeenCalled();
    setTimeout(function () {
      expect((compiled as HTMLDivElement).innerHTML)
        .toContain('ok-translated-dec');
    }, 1000);
  });
});
