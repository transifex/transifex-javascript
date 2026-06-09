import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';

import { TranslationService } from './translation.service';
import { TxInstanceContext } from './tx-instance-context';
import { TxNative } from '@transifex/native';

/**
 * Component that sets up an alternative TX Native instance.
 *
 * Provides its own {@link TxInstanceContext} so components nested inside a
 * `<tx-instance>` element (T, UT, tx-language-picker) see this instance's alias
 * rather than the root-level one.
 */
@Component({
  standalone: true,
  selector: 'tx-instance',
  template: `<ng-content></ng-content>`,
  providers: [TxInstanceContext],
})
export class TXInstanceComponent implements OnInit {
  @Input() alias = '';
  @Input() token = '';
  @Input() controlled = true;

  @Output() instanceReady: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Observables for detecting instance readiness
  get instanceIsReady(): Observable<boolean> {
    return this.txContext.instanceIsReady;
  }

  // The instance
  private nativeInstance?: TxNative;

  constructor(
    private translationService: TranslationService,
    private txContext: TxInstanceContext,
  ) {}

  async ngOnInit(): Promise<void> {
    this.txContext.alias = this.alias;

    if (!this.token || !this.alias) {
      this.instanceReady.emit(false);
      this.txContext.notifyInstanceReady(false);
      return;
    }

    const instanceCreated = await this.translationService.addInstance({
      token: this.token,
      alias: this.alias,
      controlled: this.controlled,
    });
    this.nativeInstance = this.translationService.getInstance(this.alias);

    if (instanceCreated && this.nativeInstance) {
      this.instanceReady.emit(true);
      this.txContext.notifyInstanceReady(true);
    } else {
      this.instanceReady.emit(false);
      this.txContext.notifyInstanceReady(false);
    }
  }
}
