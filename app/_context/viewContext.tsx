import React, { createContext, useState, ReactNode, useEffect, useContext } from "react";

export type ActiveView = 'play' | 'standings' | 'earn' | 'win' | 'profile';


interface ViewContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const viewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('play');

  return (
    <viewContext.Provider value={{ activeView, setActiveView }}>
      {children}
    </viewContext.Provider>
  );
};

export const useView = () => {
  const context = useContext(viewContext);
  if (!context) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
};