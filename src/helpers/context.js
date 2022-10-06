import { createContext, useState } from 'react';

const AppContext = createContext(0, () => {});

export const AppProvider = ({ children }) => {
  const [searchData, setSearchData] = useState(null);
  const [searchQuery, setSearchQuery] = useState(null);
  const [searchPath, setSearchPath] = useState(null);

  return (
    <AppContext.Provider
      value={{
        searchData,
        setSearchData,
        searchQuery,
        setSearchQuery,
        searchPath,
        setSearchPath,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
