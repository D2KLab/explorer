import { createContext, useContext } from 'react';

export const GraphContext = createContext();
export const GraphProvider = GraphContext.Provider;

/**
 * A hook that returns the graphs from the GraphContext.
 * @returns {Graph[]} - the graphs from the GraphContext.
 */
export function useGraphs() {
  const [graphs] = useContext(GraphContext);
  return graphs;
}
