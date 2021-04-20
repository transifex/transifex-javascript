import { Component, OnInit } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T } from '../src/lib/T.decorator';
import { TranslationService } from '../src/public-api';

const { tx } = require('@transifex/native');

describe('T Decorator', () => {
  let service: TranslationService;
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

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    spyOn(tx, 'translate').and.returnValue('ok-translated-dec');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should test the decorator T', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(tx.translate).toHaveBeenCalled();
    expect((compiled as HTMLDivElement).innerHTML)
      .toContain('ok-translated-dec');
  });
});
