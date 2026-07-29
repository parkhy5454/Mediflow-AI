import React, { createContext, useContext, useState } from 'react';

const NurseContext = createContext();

export const NurseProvider = ({ children }) => {
  const [nurses, setNurses] = useState([]);

  return (
    <NurseContext.Provider value={{ nurses, setNurses }}>
      {children}
    </NurseContext.Provider>
  );
};

export const useNurseContext = () => useContext(NurseContext);
