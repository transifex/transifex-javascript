import { useState, useEffect, useContext } from 'react';
import {
  tx,
  onEvent,
  offEvent,
  FETCHING_TRANSLATIONS,
  TRANSLATIONS_FETCHED,
  LOCALE_CHANGED,
} from '@transifex/native';
import { TXNativeContext } from '../context/TXNativeContext';

export default function useTranslations(filterTags) {
  // Check for a different tx initialization
  const context = useContext(TXNativeContext);
  const instance = context.instance || tx;

  const [ready, setReady] = useState(
    (instance.fetchedTags[instance.currentLocale] || []).indexOf(filterTags) !== -1,
  );

  useEffect(() => {
    function setReadyToFalse({ filterTags: eventFilterTags }, caller) {
      if (caller !== instance) return;
      if (eventFilterTags === filterTags) {
        setReady(false);
      }
    }
    onEvent(FETCHING_TRANSLATIONS, setReadyToFalse);

    function setReadyToTrue({ filterTags: eventFilterTags }, caller) {
      if (caller !== instance) return;
      if (eventFilterTags === filterTags) {
        setReady(true);
      }
    }
    onEvent(TRANSLATIONS_FETCHED, setReadyToTrue);

    async function fetchTranslations() {
      if (instance.currentLocale) {
        await instance.fetchTranslations(instance.currentLocale, { filterTags });
      }
      setReady(true);
    }

    fetchTranslations();
    onEvent(LOCALE_CHANGED, fetchTranslations);

    return () => {
      offEvent(FETCHING_TRANSLATIONS, setReadyToFalse);
      offEvent(TRANSLATIONS_FETCHED, setReadyToTrue);
      offEvent(LOCALE_CHANGED, fetchTranslations);
    };
  }, [filterTags, instance]);

  return { ready };
}
