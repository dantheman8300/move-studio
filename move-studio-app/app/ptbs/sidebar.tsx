'use client';
import { SuiClient } from "@mysten/sui.js/client";
import { useWallet } from "@suiet/wallet-kit";
import { useState } from "react";
import { FunctionNodeData } from "./FunctionNode";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ObjectNodeData } from "./ObjectNode";

export default function Sidebar() {

  const wallet = useWallet();


  const [packageIdInput, setPackageIdInput] = useState('');
  const [functions, setFunctions] = useState<FunctionNodeData[]>([]);
  const [searchedFunction, setSearchedFunction] = useState('');

  const [objectIdInput, setObjectIdInput] = useState('');
  const [object, setObject] = useState<ObjectNodeData | null>(null);

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

  const handleObjectLookup = async () => {
    const client = new SuiClient({ url: wallet.chain?.rpcUrl || "" });

    console.log("client", client);

    try {
      // get the object details
      const res = await client.getObject({
        id: objectIdInput,
        options: {
          showOwner: true,
          showType: true,
          showContent: true,
        },
      });

      console.log("object res", res);

      let objectData = {
        objectId: objectIdInput,
        fields: (res.data as any).fields,
        owner: (res.data?.owner as any).Shared !== undefined ? 'Shared' : (res.data?.owner as any).AddressOwner,
        hasPublicTransfer: (res.data?.content as any).hasPublicTransfer,
        type: (res.data?.content as any).type,
      }

      setObject(objectData);

    } catch (error) {
      console.error("error fetching object", error);
    }

  }


  return (  
    <aside className="h-[500px] flex flex-row items-start justify-around w-full">
      <div>
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
      </div>
      <div>
        <input type="text" value={objectIdInput} onChange={(event) => setObjectIdInput(event.target.value)} />
        <button onClick={handleObjectLookup}>Look up</button>
        {
          object && (
            <div onDragStart={(event) => onDragStart(event, 'objectNode', object)} draggable>
              <span>{object.type.split("::").pop()}</span>
            </div>
          )
        }
      </div>
      <div>
        <div onDragStart={(event) => onDragStart(event, 'coinSplitterNode')} draggable>
          Coin splitter
        </div>
        <div onDragStart={(event) => onDragStart(event, 'gasCoinNode')} draggable>
          Gas coin
        </div>
        <div onDragStart={(event) => onDragStart(event, 'coinMergerNode')} draggable>
          Coin merger
        </div>
      </div>
    </aside>
  );
}