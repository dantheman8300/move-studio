import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  const height = 100 + data.parameters.length * 30 + data.typeParameters.length * 30;

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
              <Handle 
                id={`T${index}`}
                type="target"
                position={Position.Left}
                isConnectableEnd={false}
                isConnectableStart={false}
                style={{ top: `${(index + 1) * 30 + 50}px` }}
              >
                <div className="absolute left-2 -top-3 flex flex-row items-center">
                  <span>T{index}: </span>
                  <input placeholder={abilitityString} />
                </div>
              </Handle>
            )
          })
        }
        {
          data.parameters.map((parameter, index) => {
            console.log('parameter', parameter)

            if (parameter.Struct !== undefined) {

              const type = `${parameter.Struct.address}::${parameter.Struct.module}::${parameter.Struct.name}`

              return (
                <Handle 
                  id={`Arg${index}`}
                  type="target"
                  position={Position.Left}
                  isConnectableEnd={true}
                  isConnectableStart={false}
                  style={{ top: `${(data.typeParameters.length + index + 1) * 30 + 50}px` }}
                >
                  <div className="absolute left-2 -top-3 flex flex-row items-center">
                    <span>Arg{index}: </span>
                    <span>{type}</span>
                  </div>
                </Handle>
              )
            } else if (parameter.MutableReference !== undefined) {

              if (parameter.MutableReference.Struct !== undefined) {

                const type = `&mut ${parameter.MutableReference.Struct.address}::${parameter.MutableReference.Struct.module}::${parameter.MutableReference.Struct.name}`

                if (type.endsWith(`::tx_context::TxContext`)) {
                  return 
                }
                
                return (
                  <Handle 
                    id={`Arg${index}`}
                    type="target"
                    position={Position.Left}
                    isConnectableEnd={true}
                    isConnectableStart={false}
                    style={{ top: `${(data.typeParameters.length + index + 1) * 30 + 50}px` }}
                  >
                    <div className="absolute left-2 -top-3 flex flex-row items-center">
                      <span>Arg{index}: </span>
                      <input placeholder={type} />
                    </div>
                  </Handle>
                )
              } else {
                return (
                  <Handle 
                    id={`Arg${index}`}
                    type="target"
                    position={Position.Left}
                    isConnectableEnd={true}
                    isConnectableStart={false}
                    style={{ top: `${(data.typeParameters.length + index + 1) * 30 + 50}px` }}
                  >
                    <div className="absolute left-2 -top-3 flex flex-row items-center">
                      <span>Arg{index}: </span>
                      <input placeholder={parameter.MutableReference} />
                    </div>
                  </Handle>
                )
              }
            } else if (parameter.TypeParameter !== undefined) {
                
              return (
                <Handle 
                  id={`Arg${index}`}
                  type="target"
                  position={Position.Left}
                  isConnectableEnd={true}
                  isConnectableStart={false}
                  style={{ top: `${(data.typeParameters.length + index + 1) * 30 + 50}px` }}
                >
                  <div className="absolute left-2 -top-3 flex flex-row items-center">
                    <span>Arg{index}: </span>
                    <span>T{parameter.TypeParameter}</span>
                  </div>
                </Handle>
              )

            } else {
              console.log('parameter', parameter)
              return (
                <Handle 
                  id={`Arg${index}`}
                  type="target"
                  position={Position.Left}
                  isConnectableEnd={true}
                  isConnectableStart={false}
                  style={{ top: `${(data.typeParameters.length + index + 1) * 30 + 50}px` }}
                >
                  <div className="absolute left-2 -top-3 flex flex-row items-center">
                    <span>Arg{index}: </span>
                    <input placeholder={parameter} />
                  </div>
                </Handle>
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