import React from 'react';
import { TXNativeContext } from '../context/TXNativeContext';

export default function TXProvider({ instance, children }) {
  return (
    <TXNativeContext.Provider value={{instance}}>
      {children}
    </TXNativeContext.Provider>
  );
}
