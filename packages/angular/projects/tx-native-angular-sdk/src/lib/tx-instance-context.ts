import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

/**
 * Injectable handle for the active TX Native instance alias and async readiness.
 *
 * `providedIn: 'root'` ensures standalone {@link TComponent}, {@link UTComponent},
 * {@link LanguagePickerComponent}, and {@link TranslatePipe} can always resolve this token
 * regardless of whether they are used inside a `<tx-instance>` wrapper or not.
 *
 * {@link TXInstanceComponent} shadows this with its own `providers: [TxInstanceContext]`
 * so that components nested inside a `<tx-instance>` element see that instance's alias.
 */
@Injectable({ providedIn: 'root' })
export class TxInstanceContext {
  alias = '';

  private readonly instanceReadySubject = new ReplaySubject<boolean>(0);

  get instanceIsReady(): Observable<boolean> {
    return this.instanceReadySubject.asObservable();
  }

  notifyInstanceReady(ready: boolean): void {
    this.instanceReadySubject.next(ready);
  }
}
