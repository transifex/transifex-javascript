import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from './translation.service';

@Pipe({
  name: 'translate',
})
export class TranslatePipe implements PipeTransform {
  /**
   * Constructor
   */
  constructor(protected translationService: TranslationService) {}

  /**
   * Transforms str into a translated string.
   */
  transform(str: string, translateParams?: Record<string, unknown>): string {
    const params = translateParams ?? {};

    return this.translationService.translate(str, params);
  }
}
