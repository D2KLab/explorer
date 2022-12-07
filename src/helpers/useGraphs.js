import { createContext, useContext } from 'react';

export const GraphContext = createContext();
export const GraphProvider = GraphContext.Provider;

export function useGraphs() {
  const [graphs] = useContext(GraphContext);
  return graphs;
}
