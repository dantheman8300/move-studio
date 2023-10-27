import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { TransactionBlock } from "@mysten/sui.js/transactions"

import {normalizeStructTag} from '@mysten/sui.js/utils'
import { useWallet } from "@suiet/wallet-kit"
import { useEffect, useState } from "react"


export default function FunctionCard(
  props: {
    data: any, 
    address: string,
    moduleName: string, 
    functionName: string, 
    addTransactionDigest: (digestId: string, objects: {type: string, modified: string, objectId: string}[]) => void
  }
) {

  const { toast } = useToast()

  const wallet = useWallet();

  const [typeParameters, setTypeParameters] = useState<any[]>([]);
  const [parameters, setParameters] = useState<any[]>([]);

  useEffect(() => {
    console.log('props.data', props.data)
    const typeParametersEmpty = props.data.typeParameters.map(() => {
      return '';
    });
    setTypeParameters(typeParametersEmpty);

    const parametersEmpty = props.data.parameters.filter((param: any) => {
      if (
        param.MutableReference != undefined && 
        param.MutableReference.Struct != undefined && 
        `${param.MutableReference.Struct.address}::${param.MutableReference.Struct.module}::${param.MutableReference.Struct.name}` === '0x2::tx_context::TxContext'
      ) {
        return false;
      }
    }).map(() => {
      return '';
    });

    setParameters(parametersEmpty);
  }, [props.data])

  const executeFunction = async () => {
    if (!wallet.connected) return

    console.log('typeParameters', typeParameters)
    console.log('parameters', parameters)

    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${props.address}::${props.moduleName}::${props.functionName}`,
      arguments: parameters.map((param) => {
        return tx.pure(param);
      }),
      typeArguments: typeParameters
    });
    
    try {
      // execute the programmable transaction
      const resData = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx,
      } as any);
      console.log('nft minted successfully!', resData);

      const objects = [];

      for (let objectChange of resData.objectChanges || []) {
        if (objectChange.type === 'published') {

        } else {
          console.log('object change', objectChange)
          objects.push({
            type: objectChange.objectType,
            modified: objectChange.type,
            objectId: objectChange.objectId,
            // owner: objectChange.owner
          })
        }
      }

      props.addTransactionDigest(resData.digest, objects);
      // alert('Congrats! your nft is minted!')
    } catch (e) {
      console.error('nft mint failed', e);
    }
  }

  return (
    <div className="flex flex-col items-center justify-start w-full px-4 gap-3">
      <div className="flex flex-col items-start w-full gap-3">
        {
          props.data.typeParameters.map((parameter: any, index: number) => {
            console.log('type parameter', parameter)
            return (
              <div key={index} className="grid w-full max-w-sm items-center gap-1.5 font-mono">
                <Label className="text-slate-400" htmlFor={`T${index}`}>Type{index}</Label>
                <Input className="bg-slate-900 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-teal-500 font-mono caret-teal-500" type="text" id={`T${index}`} placeholder={`T${index}`} value={typeParameters[index]} onChange={(e) => {
                  const newTypeParameters = typeParameters;
                  newTypeParameters[index] = e.target.value;
                  setTypeParameters(newTypeParameters);
                }} />
              </div>
            )
          })
        }
      </div>
      <div className="flex flex-col items-start w-full gap-3">
        {
          props.data.parameters.map((parameter: any, index: number) => {
            console.log(parameter)
            if (parameter.Reference != undefined) {
              const type = parameter.Reference;
              if (type.Struct != undefined) {
                if (`${type.Struct.address}::${type.Struct.module}::${type.Struct.name}` === '0x2::tx_context::TxContext') {
                  return 
                }

                return (
                  <div key={index} className="grid w-full max-w-sm items-center gap-1.5 font-mono">
                    <Label className="text-slate-400" htmlFor={`arg${index}`}>Arg{index}</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Input className="bg-slate-900 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-teal-500 font-mono caret-teal-500" type="text" id={`arg${index}`} placeholder={`ref - ${type.Struct.address}::${type.Struct.module}::${type.Struct.name}`} value={parameters[index]} onChange={(e) => {
                            const newParameters = parameters;
                            newParameters[index] = e.target.value;
                            setParameters(newParameters);
                          }} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{`${type.Struct.address}::${type.Struct.module}::${type.Struct.name}`}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )
              }
            } else if (parameter.MutableReference != undefined) {
              const type = parameter.MutableReference;
              if (type.Struct != undefined) {
                if (`${type.Struct.address}::${type.Struct.module}::${type.Struct.name}` === '0x2::tx_context::TxContext') {
                  return 
                }

                return (
                  <div key={index} className="grid w-full max-w-sm items-center gap-1.5 font-mono">
                    <Label className="text-slate-400" htmlFor={`arg${index}`}>Arg{index}</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Input className="bg-slate-900 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-teal-500 font-mono caret-teal-500" type="text" id={`arg${index}`} placeholder={`mutRef - ${type.Struct.address}::${type.Struct.module}::${type.Struct.name}`} value={parameters[index]} onChange={(e) => {
                            const newParameters = parameters;
                            newParameters[index] = e.target.value;
                            setParameters(newParameters);
                          }} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{`${type.Struct.address}::${type.Struct.module}::${type.Struct.name}`}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )
              }
            } else if (parameter.Struct != undefined) {
              const struct = parameter.Struct;
              return (
                <div key={index} className="grid w-full max-w-sm items-center gap-1.5 font-mono">
                  <Label className="text-slate-400" htmlFor={`arg${index}`}>Arg{index}</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Input className="bg-slate-900 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-teal-500 font-mono caret-teal-500" type="text" id={`arg${index}`} placeholder={`${struct.address}::${struct.module}::${struct.name}`} value={parameters[index]} onChange={(e) => {
                            const newParameters = parameters;
                            newParameters[index] = e.target.value;
                            setParameters(newParameters);
                          }} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{`${struct.address}::${struct.module}::${struct.name}`}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )
            }
          })
        }
      </div>
      <div className="flex flex-row items-center justify-center w-full rounded-lg border text-slate-300 hover:text-teal-500 hover:cursor-pointer active:scale-75 transition-transform h-10"  onClick={executeFunction}>
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
  ) 
}