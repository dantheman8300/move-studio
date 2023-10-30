import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


export default function StructCard(
  props: {
    data: any
  }
) {
  return (
    <div className="flex flex-col items-center justify-start w-full p-4 gap-2">
      <div className="flex flex-col items-start w-full">
        <span className="text-slate-300">Types:</span>
        <div className="ps-2 flex flex-col items-start justify-start w-full">
          {
            props.data.typeParameters.map((parameter: any, index: number) => {
              return (
                <div key={index}>
                  <span className="font-mono text-teal-800">{parameter.isPhantom && 'phantom'} T{index}</span>
                  {
                    parameter.constraints.abilities.length > 0 &&
                    <span className="text-slate-400"> has </span>
                  }
                  {
                    parameter.constraints.abilities.map((ability: string, index: number) => {
                      return <span key={index} className="text-teal-800 font-mono">
                        {`${ability}${index < parameter.constraints.abilities.length - 1 ? ', ' : ''}`}
                      </span>
                    })
                  }
                </div>
              )
            })
          }
        </div>
      </div>
      <div className="flex flex-col items-start w-full">
        <span className="text-slate-300">Fields:</span>
        <div className="ps-2 flex flex-col items-start justify-start w-full">
          {
            props.data.fields.map((field: any, index: number) => {
              console.log('field', field)
              if (field.type.Struct != undefined) {
                return (
                  <div key={index}>
                    <span className="font-mono text-slate-400">{field.name} - </span><span className="font-mono text-teal-800 hover:text-teal-500">{field.type.Struct.address}::{field.type.Struct.module}::{field.type.Struct.name}</span>
                  </div>
                )
              } else if (field.type.TypeParameter != undefined) {
                return (
                  <div key={index}>
                    <span className="font-mono text-slate-400">{field.name} - </span><span className="font-mono text-teal-800 hover:text-teal-500">T{field.type.TypeParameter}</span>
                  </div>
                )
              
              } else if (field.type.Vector != undefined) {
                return (
                  <div key={index}>
                    <span className="font-mono text-slate-400">{field.name} - </span><span className="font-mono text-teal-800 hover:text-teal-500">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>{'vector<'}{
                            field.type.Vector.Struct != undefined ?
                              `${field.type.Vector.Struct.address}::${field.type.Vector.Struct.module}::${field.type.Vector.Struct.name}`.length < 10 ?
                                `${field.type.Vector.Struct.address}::${field.type.Vector.Struct.module}::${field.type.Vector.Struct.name}`
                              :
                                `${field.type.Vector.Struct.address}::${field.type.Vector.Struct.module}::${field.type.Vector.Struct.name}`.slice(0, 4) + '...' + `${field.type.Vector.Struct.address}::${field.type.Vector.Struct.module}::${field.type.Vector.Struct.name}`.slice(-4)
                            :
                              field.type.Vector.TypeParameter != undefined ?
                                `T${field.type.Vector.TypeParameter}`
                              :
                                `${field.type.Vector.slice(0, 4)}...${field.type.Vector}`.length < 10 ?
                                  `${field.type.Vector}`
                                :
                                  `${field.type.Vector.slice(0, 4)}...${field.type.Vector.slice(-4)}`
                          }{'>'}</TooltipTrigger>
                          <TooltipContent>
                            <p>{
                            field.type.Vector.Struct != undefined ?
                              `${field.type.Vector.Struct.address}::${field.type.Vector.Struct.module}::${field.type.Vector.Struct.name}`
                            :
                              field.type.Vector.TypeParameter != undefined ?
                                `T${field.type.Vector.TypeParameter}`
                              :
                                `${field.type.Vector.slice(0, 4)}...${field.type.Vector}`
                          }</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                  </div>
                )

              } else {
                return (
                  <div key={index}>
                    <span className="font-mono text-slate-400">{field.name} - </span><span className="font-mono text-teal-800 hover:text-teal-500">{field.type}</span>
                  </div>
                )
              }
            })
          }
        </div>
      </div>
      <div className="flex flex-row justify-end w-full gap-2 py-1">
        {
          props.data.abilities.abilities.map((ability: any, index: number) => {
            return (
              <Badge key={index} variant="outline" className="font-mono">
                {ability}
              </Badge>
            )
          })
        }
      </div>
    </div>
  )
}