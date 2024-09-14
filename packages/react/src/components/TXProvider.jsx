import React from 'react';
import { WSNativeContext } from '../context/WSNativeContext';

export default function WSProvider({ instance, children }) {
  return (
    <WSNativeContext.Provider value={{instance}}>
      {children}
    </WSNativeContext.Provider>
  );
}
