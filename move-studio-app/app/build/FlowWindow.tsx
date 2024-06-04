'use client';

import Flow from "../ptbs/flow";

export default function FlowWindow() {


  return ( 
    <div className="h-screen w-full max-w-screen flex flex-col items-center dark:bg-slate-950 overflow-hidden border">
      <Flow />
    </div>
  )
}