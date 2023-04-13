import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import type { TxNative } from '@transifex/native';
import { Observable, ReplaySubject } from 'rxjs';

import { TranslationService } from './translation.service';

/**
 * A TX Native instance selector component
 */
@Component({
  selector: 'tx-instance',
  template: '<ng-content></ng-content>',
})
export class TXInstanceComponent implements OnInit {
  @Input() alias = '';

  @Input() token = '';

  @Input() controlled = true;

  @Output() instanceReady: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Observables for detecting instance readiness
  get instanceIsReady(): Observable<boolean> {
    return this.instanceReadySubject;
  }

  private instanceReadySubject = new ReplaySubject<boolean>(0);

  // The instance
  private instance?: TxNative;

  constructor(private translationService: TranslationService) {}

  async ngOnInit() {
    if (!this.token || !this.alias) {
      this.instanceReady.emit(false);
      this.instanceReadySubject.next(false);
    }
    const instanceCreated = await this.translationService.addInstance({
      token: this.token,
      alias: this.alias,
      controlled: this.controlled,
    });
    this.instance = this.translationService.getInstance(this.alias);
    if (instanceCreated && this.instance) {
      this.instanceReady.emit(true);
      this.instanceReadySubject.next(true);
    } else {
      this.instanceReady.emit(false);
      this.instanceReadySubject.next(false);
    }
  }
}
