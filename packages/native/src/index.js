import TxNative from './TxNative';

import _PseudoTranslationPolicy from './policies/PseudoTranslationPolicy';
import _SourceStringPolicy from './policies/SourceStringPolicy';

import _SourceErrorPolicy from './policies/SourceErrorPolicy';
import _ThrowErrorPolicy from './policies/ThrowErrorPolicy';

export * from './utils';
export * from './events';

export const PseudoTranslationPolicy = _PseudoTranslationPolicy;
export const SourceStringPolicy = _SourceStringPolicy;
export const SourceErrorPolicy = _SourceErrorPolicy;
export const ThrowErrorPolicy = _ThrowErrorPolicy;

export const tx = new TxNative();
export const t = tx.translate.bind(tx);
