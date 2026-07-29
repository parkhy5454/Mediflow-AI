import React, { createContext, useContext, useState } from 'react';

const RosterContext = createContext();

export const RosterProvider = ({ children }) => {
  const [roster, setRoster] = useState({});

  return (
    <RosterContext.Provider value={{ roster, setRoster }}>
      {children}
    </RosterContext.Provider>
  );
};

export const useRosterContext = () => useContext(RosterContext);
