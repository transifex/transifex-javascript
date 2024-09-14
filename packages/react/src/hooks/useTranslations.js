import { useState, useEffect, useContext } from 'react';
import {
  ws,
  onEvent,
  offEvent,
  FETCHING_TRANSLATIONS,
  TRANSLATIONS_FETCHED,
  LOCALE_CHANGED,
} from '@wordsmith/native';
import { WSNativeContext } from '../context/WSNativeContext';

export default function useTranslations(filterTags, wsInstance) {
  // Check for a different ws initialization
  const context = useContext(WSNativeContext);
  const instance = wsInstance || context.instance || ws;

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
