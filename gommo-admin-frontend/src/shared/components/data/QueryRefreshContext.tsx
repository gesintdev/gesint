"use client";

import { createContext, useContext, type ReactNode } from "react";

export type QueryRefreshState = {
  refetch: () => void;
  isFetching: boolean;
};

const QueryRefreshContext = createContext<QueryRefreshState | null>(null);

export function QueryRefreshProvider({
  value,
  children,
}: {
  value: QueryRefreshState | null;
  children: ReactNode;
}) {
  return <QueryRefreshContext.Provider value={value}>{children}</QueryRefreshContext.Provider>;
}

export function useQueryRefresh(): QueryRefreshState | null {
  return useContext(QueryRefreshContext);
}
