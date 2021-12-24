import { useState, useEffect } from 'react';
import {
  tx,
  onEvent,
  offEvent,
  FETCHING_TRANSLATIONS,
  TRANSLATIONS_FETCHED,
  LOCALE_CHANGED,
} from '@transifex/native';

export default function useTranslations(filterTags) {
  const [ready, setReady] = useState(
    (tx.fetchedTags[tx.currentLocale] || []).indexOf(filterTags) !== -1,
  );

  useEffect(() => {
    function setReadyToFalse({ filterTags: eventFilterTags }) {
      if (eventFilterTags === filterTags) {
        setReady(false);
      }
    }
    onEvent(FETCHING_TRANSLATIONS, setReadyToFalse);

    function setReadyToTrue({ filterTags: eventFilterTags }) {
      if (eventFilterTags === filterTags) {
        setReady(true);
      }
    }
    onEvent(TRANSLATIONS_FETCHED, setReadyToTrue);

    async function fetchTranslations() {
      if (tx.currentLocale) {
        await tx.fetchTranslations(tx.currentLocale, { filterTags });
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
  }, [filterTags]);

  return { ready };
}
