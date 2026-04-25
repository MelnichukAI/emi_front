import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type Value = {
  /** Записи на главной развёрнуты (показаны) */
  expanded: boolean;
  setExpanded: (next: boolean) => void;
  toggleExpanded: () => void;
};

const HomeRecentEntriesContext = createContext<Value | null>(null);

export function HomeRecentEntriesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = useCallback(() => {
    setExpanded((v) => !v);
  }, []);

  const value = useMemo(
    () => ({
      expanded,
      setExpanded,
      toggleExpanded,
    }),
    [expanded, toggleExpanded],
  );

  return (
    <HomeRecentEntriesContext.Provider value={value}>
      {children}
    </HomeRecentEntriesContext.Provider>
  );
}

export function useHomeRecentEntries() {
  const ctx = useContext(HomeRecentEntriesContext);
  if (!ctx) {
    throw new Error(
      "useHomeRecentEntries must be used within HomeRecentEntriesProvider",
    );
  }
  return ctx;
}
