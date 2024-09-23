'use client';

import { createContext } from "react";
import { PTBGraph } from "./ptb-types";


export type GraphContextType = {
  graph: PTBGraph | null;
};

export const GraphContext = createContext<GraphContextType>({
  graph: null,
});

export default function GraphProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const graph = new PTBGraph();

  return (
    <GraphContext.Provider value={{ graph }}>{children}</GraphContext.Provider>
  );
}