import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Handle, Position } from "reactflow";


export type FunctionNodeData = {
  packageAddress: string;
  moduleName: string;
  functionName: string;
  isEntry: boolean;
  visibility: string;
  typeParameters: any[];
  parameters: any[];
  return: any[];
}

export default function FunctionNode( 
  { data, isConnectable }: { data: FunctionNodeData; isConnectable: boolean }
) {

  const height = Math.max(100 + data.parameters.length * 50 + data.typeParameters.length * 50, data.return.length * 50 + 200);

  const [typeParameterInputs, setTypeParameterInputs] = useState<string[]>(new Array(data.typeParameters.length).fill(''));
  const [parameterInputs, setParameterInputs] = useState<string[]>(new Array(data.parameters.length).fill(''));

  return (
    <Card className={`border text-center`} style={{ height: height, width: 400 }} >
      <CardHeader>
        <CardTitle>
          {data.packageAddress}::{data.moduleName}::{data.functionName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {
          data.typeParameters.map((typeParameter, index) => {
            console.log('typeParameter', typeParameter)

            const abilitityString = typeParameter.abilities.join(', ')

            return (
              <div>
                <Handle 
                  id={`T${index}`}
                  type="target"
                  position={Position.Left}
                  isConnectableEnd={false}
                  isConnectableStart={false}
                  style={{ top: `${(index + 1) * 50 + 50}px`}}
                />
                <div 
                  className="absolute left-2 flex flex-row items-center"
                  style={{ top: `${((index + 1) * 50 + 50 ) - 16}px`}}
                >
                  <span>T{index}: </span>
                  <Input 
                    className="bg-slate-900 h-8 caret-teal-500"
                    type="text"
                    placeholder={abilitityString} 
                    value={typeParameterInputs[index]} 
                    onChange={
                      (event) => {
                        console.log('event', event.target.value)
                        const newInputs = typeParameterInputs.slice();
                        newInputs[index] = event.target.value;
                        setTypeParameterInputs(newInputs);
                      }
                    } 
                  />
                </div>
              </div>
            )
          })
        }
        {
          data.parameters.map((parameter, index) => {
            console.log('parameter', parameter)

            if (parameter.Struct !== undefined) {

              const type = `${parameter.Struct.address}::${parameter.Struct.module}::${parameter.Struct.name}`

              return (
                <div>
                  <Handle 
                    id={`Arg${index}`}
                    type="target"
                    position={Position.Left}
                    isConnectableEnd={true}
                    isConnectableStart={false}
                    style={{ top: `${(data.typeParameters.length + index + 1) * 50 + 50}px` }}
                    onConnect={(params) => console.log('handle onConnect', params)}

                  />
                  <div 
                    className="absolute left-2 -top-3 flex flex-row items-center"
                    style={{ top: `${((data.typeParameters.length + index + 1) * 50 + 50 - 16)}px` }}
                  >
                    <span>Arg{index}: </span>
                    <span>{type}</span>
                  </div>
                </div>
              )
            } else if (parameter.MutableReference !== undefined) {

              if (parameter.MutableReference.Struct !== undefined) {

                const type = `&mut ${parameter.MutableReference.Struct.address}::${parameter.MutableReference.Struct.module}::${parameter.MutableReference.Struct.name}`

                if (type.endsWith(`::tx_context::TxContext`)) {
                  return 
                }
                
                return (
                  <div>
                    <Handle 
                      id={`Arg${index}`}
                      type="target"
                      position={Position.Left}
                      isConnectableEnd={true}
                      isConnectableStart={false}
                      style={{ top: `${(data.typeParameters.length + index + 1) * 50 + 50}px` }}
                    />
                    <div 
                      className="absolute left-2 flex flex-row items-center"
                      style={{ top: `${((data.typeParameters.length + index + 1) * 50 + 50 - 16)}px` }}
                    >
                      <span>Arg{index}: </span>
                      <Input 
                    className="bg-slate-900 h-8 caret-teal-500"
                    type="text" placeholder={type} />
                    </div>
                  </div>
                )
              } else {
                return (
                  <Handle 
                    id={`Arg${index}`}
                    type="target"
                    position={Position.Left}
                    isConnectableEnd={true}
                    isConnectableStart={false}
                    style={{ top: `${(data.typeParameters.length + index + 1) * 50 + 50}px` }}
                  >
                    <div className="absolute left-2 -top-3 flex flex-row items-center">
                      <span>Arg{index}: </span>
                      <Input 
                    className="bg-slate-900 h-8 caret-teal-500"
                    type="text" placeholder={parameter.MutableReference} />
                    </div>
                  </Handle>
                )
              }
            } else if (parameter.Reference !== undefined) {

              if (parameter.Reference.Struct !== undefined) {

                const type = `&mut ${parameter.Reference.Struct.address}::${parameter.Reference.Struct.module}::${parameter.Reference.Struct.name}`

                if (type.endsWith(`::tx_context::TxContext`)) {
                  return 
                }
                
                return (
                  <div>
                    <Handle 
                      id={`Arg${index}`}
                      type="target"
                      position={Position.Left}
                      isConnectableEnd={true}
                      isConnectableStart={false}
                      style={{ top: `${(data.typeParameters.length + index + 1) * 50 + 50}px` }}
                    />
                    <div 
                      className="absolute left-2 flex flex-row items-center"
                      style={{ top: `${((data.typeParameters.length + index + 1) * 50 + 50 - 16)}px` }}
                    >
                      <span>Arg{index}: </span>
                      <Input 
                    className="bg-slate-900 h-8 caret-teal-500"
                    type="text" placeholder={type} />
                    </div>
                  </div>
                )
              } else {
                return (
                  <Handle 
                    id={`Arg${index}`}
                    type="target"
                    position={Position.Left}
                    isConnectableEnd={true}
                    isConnectableStart={false}
                    style={{ top: `${(data.typeParameters.length + index + 1) * 50 + 50}px` }}
                  >
                    <div className="absolute left-2 -top-3 flex flex-row items-center">
                      <span>Arg{index}: </span>
                      <Input 
                    className="bg-slate-900 h-8 caret-teal-500"
                    type="text" placeholder={parameter.Reference} />
                    </div>
                  </Handle>
                )
              }
            } else if (parameter.TypeParameter !== undefined) {
                
              return (
                <div>
                  <Handle
                    id={`Arg${index}`}
                    type="target"
                    position={Position.Left}
                    isConnectableEnd={true}
                    isConnectableStart={false}
                    style={{ top: `${(data.typeParameters.length + index + 1) * 50 + 50}px` }}
                  />
                  <div 
                    className="absolute left-2 -top-3 flex flex-row items-center"
                    style={{ top: `${((data.typeParameters.length + index + 1) * 50 + 50 - 16)}px` }}
                  >
                    <span>Arg{index}: </span>
                    <Input 
                    className="bg-slate-900 h-8 caret-teal-500"
                    type="text" placeholder={parameter.TypeParameter} />
                  </div>
                </div>
              )

            } else {
              console.log('parameter', parameter)
              return (
                <div>
                  <Handle
                    id={`Arg${index}`}  
                    type="target"
                    position={Position.Left}
                    isConnectableEnd={true}
                    isConnectableStart={false}
                    style={{ top: `${(data.typeParameters.length + index + 1) * 50 + 50}px` }}
                  />
                  <div
                    className="absolute left-2 -top-3 flex flex-row items-center"
                    style={{ top: `${((data.typeParameters.length + index + 1) * 50 + 50 - 16)}px` }}
                  >
                    <span>Arg{index}: </span>
                    <Input 
                    className="bg-slate-900 h-8 caret-teal-500"
                    type="text" placeholder={parameter} />
                  </div>
                </div>
              )
            }
            
          })
        }
        {
          data.return.map((ret, index) => {
            // console.log('ret', ret)

            if (ret.Struct !== undefined) {
              return (
                <div>
                  <Handle 
                    id={`R${index}`}
                    type="source"
                    position={Position.Right}
                    isConnectableStart={true}
                    isConnectableEnd={false}
                    style={{ top: `${(index + 1) * 50 + height/3}px` }}
                  >
                    <span className="absolute right-2 -top-3">
                      {ret.Struct.address}::{ret.Struct.module}::{ret.Struct.name}
                    </span>
                  </Handle>
                </div>
              )
            }

            
          })
        }
      </CardContent>
    </Card>
  )
}