import Flow from "./flow";
import GraphProvider from "./GraphProvider";



export default function Page() {
  return (
    <div className="h-screen w-full max-w-screen flex flex-col items-center dark:bg-slate-950 overflow-hidden border">
      <GraphProvider>
        <Flow />
      </GraphProvider>
    </div>
  )
}