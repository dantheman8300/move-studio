'use client';
import { SuiClient } from "@mysten/sui.js/client";
import { useWallet } from "@suiet/wallet-kit";
import { useState } from "react";
import { FunctionNodeData } from "./FunctionNode";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Sidebar() {

  const wallet = useWallet();


  const [packageIdInput, setPackageIdInput] = useState('');
  const [functions, setFunctions] = useState<FunctionNodeData[]>([]);
  const [searchedFunction, setSearchedFunction] = useState('');

  const onDragStart = (event: any, nodeType: string, data = {}) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('data', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  }

  const handlePackageLookup = async () => {
    const client = new SuiClient({ url: wallet.chain?.rpcUrl || "" });

    console.log("client", client);

    try {
      // get the package details
      const res = await client.getNormalizedMoveModulesByPackage({
        package: packageIdInput,
      });
      console.log("package res", res);

      const modules = Object.entries(res);

      const functions = modules.map(([moduleName, module]) => {
        return Object.entries(module.exposedFunctions).map(([functionName, func]) => {
          return {
            packageAddress: packageIdInput,
            moduleName,
            functionName,
            isEntry: (func as any).isEntry,
            visibility: (func as any).visibility,
            typeParameters: (func as any).typeParameters,
            parameters: (func as any).parameters,
            return: (func as any).return,
          }
        })
      }).flat();

      setFunctions(functions);

    } catch (error) {
      console.error("error fetching package", error);
    }

  }

  return (  
    <aside className="h-[500px]">
      <div className="description">You can drag these nodes to the pane on the right.</div>
      <input type="text" value={packageIdInput} onChange={(event) => setPackageIdInput(event.target.value)} />
      <button onClick={handlePackageLookup}>Look up</button>
      <div className="flex flex-col items-center justify-start gap-2">
        <Input
          className="bg-slate-900 h-8 caret-teal-500"
          type="text"
          placeholder="Search modules..."
          onChange={(e) => {
            setSearchedFunction(e.target.value);
          }}
          value={searchedFunction}
        />
        <ScrollArea className="h-full max-h-[400px] w-fit max-w-[260px] rounded-md border p-1 overflow-y-auto">
          {functions
            .filter((func) => {
              return func.functionName.includes(searchedFunction) || func.moduleName.includes(searchedFunction);
            })
            .map((func, index) => {
              return (
                <div key={index} onDragStart={(event) => onDragStart(event, 'functionNode', func)} draggable>
                  {func.packageAddress}::{func.moduleName}::{func.functionName}
                </div>
              );
            })}
        </ScrollArea>
      </div>
      <div onDragStart={(event) => onDragStart(event, 'functionNode')} draggable>
        Function Node
      </div>
      <div onDragStart={(event) => onDragStart(event, 'objectNode')} draggable>
        Object Node
      </div>
    </aside>
  );
}