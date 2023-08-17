import { createContext, useContext, useState } from 'react';

const ReloadContext = createContext();

export const useReloadData = () => {
  return useContext(ReloadContext);
};

export const ReloadDataProvider = ({ children }) => {
  const [reload, setReload] = useState(false);

  return (
    <ReloadContext.Provider value={{ reload, setReload }}>
      {children}
    </ReloadContext.Provider>
  );
};
