"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ChangeEvent, useContext, useEffect, useState } from "react";

import { BuildContext } from "@/Contexts/BuildProvider";
import { track } from "@vercel/analytics";
import { useCurrentWallet, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

export default function FunctionCard(props: {
  data: any;
  address: string;
  moduleName: string;
  functionName: string;
}) {
  const { addTransactionDigest } = useContext(BuildContext);

  const suiClient = useSuiClient();
	const { isConnected } = useCurrentWallet();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();


  const [typeParameters, setTypeParameters] = useState<any[]>([]);
  const [parameters, setParameters] = useState<any[]>([]);

  useEffect(() => {
    console.log("props.data", props.data);
    const typeParametersEmpty = props.data.typeParameters.map(() => {
      return "";
    });
    setTypeParameters(typeParametersEmpty);

    const parametersEmpty = props.data.parameters
      .filter((param: any) => {
        console.log('param', param)
        if (
          param.MutableReference != undefined &&
          param.MutableReference.Struct != undefined &&
          `${param.MutableReference.Struct.address}::${param.MutableReference.Struct.module}::${param.MutableReference.Struct.name}` ===
            "0x2::tx_context::TxContext"
        ) {
          console.log('tx_context')
          return false;
        }
        console.log('not tx_context')
        return true;
      })
      .map(() => {
        return "";
      });

      console.log('parametersEmpty', parametersEmpty)

    setParameters(parametersEmpty);
  }, [props.data]);

  const handleArgInputChange = (position: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setParameters([
      ...parameters.slice(0, position),
      value,
      ...parameters.slice(position + 1)
    ])
  }

  const handleTypeInputChange = (position: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTypeParameters([
      ...typeParameters.slice(0, position),
      value,
      ...typeParameters.slice(position + 1)
    ])
  }


  const executeFunction = async () => {
    if (!isConnected) return;

    console.log("typeParameters", typeParameters);
    console.log("parameters", parameters);

    track("execute_function", {
      address: props.address,
      module_name: props.moduleName,
      function_name: props.functionName,
      type_parameters_count: typeParameters.length,
      parameters_count: parameters.length,
    });

    const tx = new Transaction();
    tx.moveCall({
      target: `${props.address}::${props.moduleName}::${props.functionName}`,
      arguments: parameters.map((param, index) => {
        console.log('param', param)
        console.log('props.data.parameters[index]', props.data.parameters[index])
        if (props.data.parameters[index] === "Bool") {
          return tx.pure.bool(param.toLowerCase() === "true")
        }
        return tx.pure(param);
      }),
      typeArguments: typeParameters,
    });

    try {
      // execute the programmable transaction
      signAndExecuteTransaction(
        {
          transaction: tx,
          
        }, 
        {
          onSuccess: ({ digest }) => {
            suiClient
              .waitForTransaction({
                digest: digest,
                options: {
                  showEffects: true,
                  showObjectChanges: true,
                },
              })
              .then((tx) => {
                const objectId = tx.effects?.created?.[0]?.reference?.objectId;
  
                console.log("nft minted successfully!", tx);

                const objects = [];

                for (let objectChange of tx.objectChanges || []) {
                  if (objectChange.type === "published") {
                  } else {
                    console.log("object change", objectChange);
                    objects.push({
                      type: objectChange.objectType,
                      modified: objectChange.type,
                      objectId: objectChange.objectId,
                      // owner: objectChange.owner
                    });
                  }
                }

                addTransactionDigest(tx.digest, objects);
              });
          },
        }
      );
      
      // alert('Congrats! your nft is minted!')
    } catch (e) {
      console.error("nft mint failed", e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start w-full px-4 gap-3">
      <div className="flex flex-col items-start w-full gap-3">
        {props.data.typeParameters.map((parameter: any, index: number) => {
          console.log("type parameter", parameter);
          return (
            <div
              key={index}
              className="grid w-full max-w-sm items-center gap-1.5 font-mono"
            >
              <Label className="text-slate-400" htmlFor={`T${index}`}>
                Type{index}
              </Label>
              <Input
                className="bg-slate-900 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-teal-500 font-mono caret-teal-500"
                type="text"
                id={`T${index}`}
                placeholder={`T${index}`}
                value={typeParameters[index]}
                onChange={handleTypeInputChange(index)}
              />
            </div>
          );
        })}
      </div>
      <div className="flex flex-col items-start w-full gap-3">
        {props.data.parameters.map((parameter: any, index: number) => {
          console.log(parameter);
          // Check if the parameter is a string
          if (typeof parameter === 'string' || parameter instanceof String) {
            return (
              <div
                key={index}
                className="grid w-full max-w-sm items-center gap-1.5 font-mono"
              >
                <Label className="text-slate-400" htmlFor={`arg${index}`}>
                  Arg{index}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Input
                        className="bg-slate-900 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-teal-500 font-mono caret-teal-500"
                        type="text"
                        id={`arg${index}`}
                        placeholder={parameter as string}
                        value={parameters[index] || ""}
                        onChange={handleArgInputChange(index)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{parameter}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          } else if (parameter.Reference != undefined) {
            const type = parameter.Reference;
            if (type.Struct != undefined) {
              if (
                `${type.Struct.address}::${type.Struct.module}::${type.Struct.name}` ===
                "0x2::tx_context::TxContext"
              ) {
                return;
              }

              return (
                <div
                  key={index}
                  className="grid w-full max-w-sm items-center gap-1.5 font-mono"
                >
                  <Label className="text-slate-400" htmlFor={`arg${index}`}>
                    Arg{index}
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Input
                          className="bg-slate-900 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-teal-500 font-mono caret-teal-500"
                          type="text"
                          id={`arg${index}`}
                          placeholder={`ref - ${type.Struct.address}::${type.Struct.module}::${type.Struct.name}`}
                          value={parameters[index] || ""}
                          onChange={handleArgInputChange(index)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{`${type.Struct.address}::${type.Struct.module}::${type.Struct.name}`}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );
            }
          } else if (parameter.MutableReference != undefined) {
            const type = parameter.MutableReference;
            if (type.Struct != undefined) {
              if (
                `${type.Struct.address}::${type.Struct.module}::${type.Struct.name}` ===
                "0x2::tx_context::TxContext"
              ) {
                return;
              }

              return (
                <div
                  key={index}
                  className="grid w-full max-w-sm items-center gap-1.5 font-mono"
                >
                  <Label className="text-slate-400" htmlFor={`arg${index}`}>
                    Arg{index}
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Input
                          className="bg-slate-900 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-teal-500 font-mono caret-teal-500"
                          type="text"
                          id={`arg${index}`}
                          placeholder={`mutRef - ${type.Struct.address}::${type.Struct.module}::${type.Struct.name}`}
                          value={parameters[index] || ""}
                          onChange={handleArgInputChange(index)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{`${type.Struct.address}::${type.Struct.module}::${type.Struct.name}`}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );
            }
          } else if (parameter.Struct != undefined) {
            const struct = parameter.Struct;
            return (
              <div
                key={index}
                className="grid w-full max-w-sm items-center gap-1.5 font-mono"
              >
                <Label className="text-slate-400" htmlFor={`arg${index}`}>
                  Arg{index}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Input
                        className="bg-slate-900 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-teal-500 font-mono caret-teal-500"
                        type="text"
                        id={`arg${index}`}
                        placeholder={`${struct.address}::${struct.module}::${struct.name}`}
                        value={parameters[index] || ""}
                        onChange={handleArgInputChange(index)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{`${struct.address}::${struct.module}::${struct.name}`}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          } else if (parameter.TypeParameter != undefined) {
            const typeParam = parameter.TypeParameter;
            return (
              <div
                key={index}
                className="grid w-full max-w-sm items-center gap-1.5 font-mono"
              >
                <Label className="text-slate-400" htmlFor={`arg${index}`}>
                  Arg{index}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Input
                        className="bg-slate-900 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-teal-500 font-mono caret-teal-500"
                        type="text"
                        id={`arg${index}`}
                        placeholder={`T${typeParam}`}
                        value={parameters[index] || ""}
                        onChange={handleArgInputChange(index)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{`T${typeParam}`}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          }
        })}
      </div>
      <div
        className="flex flex-row items-center justify-center w-full rounded-lg border text-slate-300 hover:text-teal-500 hover:cursor-pointer active:scale-75 transition-transform h-10"
        onClick={executeFunction}
      >
        Execute
      </div>
      {/* {JSON.stringify(props.data)} */}
      {/* <div className="flex flex-row justify-end w-full gap-2 py-2">
        {
          props.data.isEntry &&
          <Badge className="rounded-full">Entry</Badge>
        }
        <Badge className="rounded-full" variant="secondary">{props.data.visibility}</Badge>
      </div> */}
    </div>
  );
}
